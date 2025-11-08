import { AppDataSource } from "../config/data-source";
import { User, CartItem } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Product } from "../entities/Product";
import { Not } from "typeorm";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private cartItemRepository = AppDataSource.getRepository(CartItem);

  private async calculateCartSummary(cart: CartItem[]): Promise<number> {
    const productRepository = AppDataSource.getRepository(Product);
    let total = 0;
    for (const item of cart) {
      const product =
        item.product ||
        (await productRepository.findOneBy({ id: item.product_id }));
      if (product) {
        total += (product.discounted_price || product.price) * item.qty;
      }
    }
    return total;
  }

  private async resolveUser(
    token: string | null,
    apiToken: string,
    relations: string[] = []
  ): Promise<User> {
    const repo = this.userRepository;

    let user: User | null = null;
    let anonymousUser: User | null = null;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: number; email: string };
      user = await repo.findOneOrFail({
        where: { id: decoded.id, email: decoded.email },
        relations,
      });

      if (apiToken) {
        anonymousUser = await repo.findOne({
          where: { api_token: apiToken, id: Not(user.id) },
          relations: ["cart", "cart.product"],
        });

        if (anonymousUser) {
          for (const anonItem of anonymousUser.cart) {
            const existing = user.cart.find(
              (item) => item.product_id === anonItem.product_id
            );
            if (existing) {
              existing.qty += anonItem.qty;
            } else {
              user.cart.push(anonItem);
            }
          }

          user.cart_summary = await this.calculateCartSummary(user.cart);
          await Promise.all([repo.save(user), repo.remove(anonymousUser)]);
        }
      }

      return user;
    }

    if (apiToken) {
      let guest = await repo.findOne({
        where: { api_token: apiToken },
        relations,
      });
      if (!guest) {
        guest = repo.create({
          api_token: apiToken,
          cart: [],
          cart_summary: 0,
          name: "Anonymous",
          email: `anonymous+${apiToken.replace(/-/g, "")}@example.com`,
        });
        await repo.save(guest);
      }
      return guest;
    }

    throw new Error("No authentication token or API token provided");
  }

  private async mergeAnonymousCart(user: User, apiToken: string) {
    const anonymousUser = await this.userRepository.findOne({
      where: { api_token: apiToken, id: Not(user.id) },
      relations: ["cart", "cart.product"],
    });

    if (!anonymousUser) return;

    if (anonymousUser.cart.length > 0) {
      const productRepo = AppDataSource.getRepository(Product);

      const userCartMap = new Map<number, CartItem>();
      for (const item of user.cart) {
        userCartMap.set(item.product_id, item);
      }

      for (const anonItem of anonymousUser.cart) {
        const existingItem = userCartMap.get(anonItem.product_id);

        if (existingItem) {
          existingItem.qty += anonItem.qty;
          await this.cartItemRepository.save(existingItem);
        } else {
          const product =
            anonItem.product ||
            (await productRepo.findOneBy({ id: anonItem.product_id }));

          if (product) {
            const newItem = this.cartItemRepository.create({
              product_id: anonItem.product_id,
              qty: anonItem.qty,
              product,
              user,
            });
            await this.cartItemRepository.save(newItem);
            user.cart.push(newItem);
            userCartMap.set(newItem.product_id, newItem);
          }
        }
      }

      user.cart_summary = await this.calculateCartSummary(user.cart);
      await this.userRepository.save(user);

      await this.cartItemRepository.delete({ user: { id: anonymousUser.id } });

      await this.userRepository.remove(anonymousUser);
    } else {
      await this.userRepository.remove(anonymousUser);
    }
  }

  async getAllUsers(limit?: number) {
    try {
      const query = this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.favorite_products", "favorite_products")
        .leftJoinAndSelect("user.cart", "cart")
        .leftJoinAndSelect("cart.product", "product");

      if (limit) {
        query.limit(limit);
      }

      return await query.getMany();
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["favorite_products", "cart", "cart.product"],
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error: any) {
      throw new Error(`Failed to fetch user by ID: ${error.message}`);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ["favorite_products", "cart", "cart.product"],
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error: any) {
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }
  }

  async registerUser(userData: {
    name: string;
    surname?: string;
    email: string;
    password: string;
    repeat_password: string;
  }) {
    try {
      const { name, surname, email, password, repeat_password } = userData;

      if (!name || !email || !password || !repeat_password) {
        throw new Error("All required fields must be filled");
      }
      if (password !== repeat_password) {
        throw new Error("Passwords do not match");
      }
      if (await this.userRepository.findOneBy({ email })) {
        throw new Error("Email already in use");
      }

      const user = this.userRepository.create({
        name,
        surname,
        email,
        password,
        favorite_products: [],
        cart: [],
        cart_summary: 0,
      });
      await this.userRepository.save(user);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" }
      );

      return { user: { ...user, password: undefined }, token };
    } catch (error: any) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  async loginUser(credentials: {
    email: string;
    password?: string;
    apiToken?: string;
  }) {
    try {
      const { email, password, apiToken } = credentials;
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ["cart", "cart.product"],
      });
      if (
        !user ||
        !password ||
        !user.password ||
        !(await bcrypt.compare(password, user.password))
      ) {
        throw new Error("Неправильный email или пароль");
      }

      if (apiToken) {
        await this.mergeAnonymousCart(user, apiToken);
      }

      let cartSummary = await this.calculateCartSummary(user.cart);
      user.cart_summary = cartSummary;
      await this.userRepository.save(user);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" }
      );

      return { user: { ...user, password: undefined }, token };
    } catch (error: any) {
      throw new Error(`Ошибка авторизации: ${error.message}`);
    }
  }

  async addToFavoritesByToken(token: string, productId: number) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: number; email: string };
      const user = await this.userRepository.findOne({
        where: { id: decoded.id, email: decoded.email },
        relations: ["favorite_products"],
      });
      if (!user) throw new Error("User not found");

      const product = await AppDataSource.getRepository(Product).findOneBy({
        id: productId,
      });
      if (!product) throw new Error("Product not found");

      if (!user.favorite_products.some((p) => p.id === productId)) {
        user.favorite_products.push(product);
        await this.userRepository.save(user);
      }
      return user.favorite_products;
    } catch (error: any) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  async removeFromFavoritesByToken(token: string, productId: number) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: number; email: string };
      const user = await this.userRepository.findOne({
        where: { id: decoded.id, email: decoded.email },
        relations: ["favorite_products"],
      });
      if (!user) throw new Error("User not found");

      user.favorite_products = user.favorite_products.filter(
        (p) => p.id !== productId
      );
      await this.userRepository.save(user);
      return user.favorite_products;
    } catch (error: any) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  async getUserByToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: number; email: string };
      const user = await this.userRepository.findOne({
        where: { id: decoded.id, email: decoded.email },
        relations: ["favorite_products", "cart", "cart.product"],
      });
      if (!user) {
        throw new Error("User not found");
      }

      let cartSummary = 0;
      if (user.cart && Array.isArray(user.cart)) {
        cartSummary = await this.calculateCartSummary(user.cart);
      } else {
        user.cart = [];
      }
      user.cart_summary = cartSummary;
      await this.userRepository.save(user);

      return { ...user, password: undefined };
    } catch (error: any) {
      throw new Error(`Failed to fetch user by token: ${error.message}`);
    }
  }

  async addToCart(
    token: string | null,
    productId: number,
    qty: number,
    apiToken: string
  ) {
    try {
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Invalid productId");
      }
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Invalid quantity");
      }

      const user = await this.resolveUser(token, apiToken, [
        "cart",
        "cart.product",
      ]);
      let cartItem = user.cart.find((item) => item.product_id === productId);

      if (cartItem) {
        cartItem.qty += qty;
      } else {
        const product = await AppDataSource.getRepository(Product).findOneBy({
          id: productId,
        });
        if (!product) throw new Error("Product not found");

        cartItem = this.cartItemRepository.create({
          product_id: productId,
          qty,
          product,
        });
        user.cart.push(cartItem);
      }

      user.cart_summary = await this.calculateCartSummary(user.cart);
      await this.userRepository.save(user);

      return { cart: user.cart, cart_summary: user.cart_summary };
    } catch (error: any) {
      console.error("Error in addToCart:", error.message, error.stack);
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  async updateCart(
    token: string | null,
    cartItemId: number,
    qty: number,
    apiToken: string
  ) {
    try {
      if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
        throw new Error("Invalid cartItemId");
      }
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Invalid quantity");
      }

      const user = await this.resolveUser(token, apiToken, [
        "cart",
        "cart.product",
      ]);
      const cartItem = user.cart.find((item) => item.id === cartItemId);
      if (!cartItem) throw new Error("Cart item not found");

      cartItem.qty = qty;
      user.cart.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()); // Сортировка по created_at
      user.cart_summary = await this.calculateCartSummary(user.cart);
      await this.userRepository.save(user);

      return { cart: user.cart, cart_summary: user.cart_summary };
    } catch (error: any) {
      console.error("Error in updateCart:", error.message, error.stack);
      throw new Error(`Failed to update cart: ${error.message}`);
    }
  }

  async getCart(token: string | null, apiToken: string) {
    try {
      const user = await this.resolveUser(token, apiToken, [
        "cart",
        "cart.product",
      ]);

      // if (token && apiToken) {
      //   await this.mergeAnonymousCart(user, apiToken);
      // }

      const cartItems = await Promise.all(
        user.cart.map(async (item) => ({
          ...item,
          product:
            item.product ||
            (await AppDataSource.getRepository(Product).findOneBy({
              id: item.product_id,
            })),
        }))
      );
      cartItems.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()); // Сортировка по created_at

      return { cart: cartItems, cart_summary: user.cart_summary };
    } catch (error: any) {
      console.error("Error in getCart:", error.message, error.stack);
      throw new Error(`Failed to get cart: ${error.message}`);
    }
  }

  async removeFromCart(
    token: string | null,
    cartItemId: number,
    apiToken: string
  ) {
    try {
      if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
        throw new Error("Invalid cartItemId");
      }

      const user = await this.resolveUser(token, apiToken, [
        "cart",
        "cart.product",
      ]);

      const cartItem = user.cart.find((item) => item.id === cartItemId);
      if (!cartItem) throw new Error("Cart item not found");

      user.cart = user.cart.filter((item) => item.id !== cartItemId);
      user.cart_summary = await this.calculateCartSummary(user.cart);
      await this.userRepository.save(user);

      return { cart: user.cart, cart_summary: user.cart_summary };
    } catch (error: any) {
      console.error("Error in removeFromCart:", error.message, error.stack);
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  async updateProfile(userId: number, profileData: Partial<User>) {
    try {
      const user = await this.getUserById(userId);
      Object.assign(user, profileData);
      await this.userRepository.save(user);
      return { ...user, password: undefined };
    } catch (error: any) {
      throw new Error(`Не удалось обновить профиль: ${error.message}`);
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.getUserById(userId);
      if (
        !user.password ||
        !(await bcrypt.compare(oldPassword, user.password))
      ) {
        throw new Error("Старый пароль неверен");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Новые пароли не совпадают");
      }
      if (newPassword === oldPassword) {
        throw new Error("Новый пароль должен отличаться от старого");
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);
      return { message: "Пароль успешно изменен" };
    } catch (error: any) {
      throw new Error(`Не удалось изменить пароль: ${error.message}`);
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.getUserById(id);
      await this.userRepository.remove(user);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}