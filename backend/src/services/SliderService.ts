import { AppDataSource } from "../config/data-source";
import { Slider } from "../entities/Slider";

export class SliderService {
  private sliderRepository = AppDataSource.getRepository(Slider);

  async getAllSliders(limit?: number) {
    try {
      const query = this.sliderRepository.createQueryBuilder("slider");

      if (limit) {
        query.limit(limit);
      }

      return await query.getMany();
    } catch (error: any) {
      throw new Error(`Failed to fetch sliders: ${error.message}`);
    }
  }

  async getSliderById(id: number) {
    try {
      const slider = await this.sliderRepository.findOneBy({ id });
      if (!slider) {
        throw new Error("Slider not found");
      }
      return slider;
    } catch (error: any) {
      throw new Error(`Failed to fetch slider by ID: ${error.message}`);
    }
  }

  async createSlider(sliderData: Partial<Slider>) {
    try {
      const slider = this.sliderRepository.create(sliderData);
      return await this.sliderRepository.save(slider);
    } catch (error: any) {
      throw new Error(`Failed to create slider: ${error.message}`);
    }
  }

  async updateSlider(id: number, sliderData: Partial<Slider>) {
    try {
      return await this.sliderRepository.save({ ...sliderData, id });
    } catch (error: any) {
      throw new Error(`Failed to update slider: ${error.message}`);
    }
  }

  async deleteSlider(id: number) {
    try {
      const slider = await this.getSliderById(id);
      await this.sliderRepository.remove(slider);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete slider: ${error.message}`);
    }
  }
}