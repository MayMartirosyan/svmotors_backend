import { Request, Response } from "express";
import { SliderService } from "../services/SliderService";
import { toCamelCase } from "../utils";
import { Slider } from "../entities/Slider";
import { deleteFile, getExistingEntity, getImagePath } from "../utils/FileUtlis";


export class SliderController {
  private sliderService: SliderService;
  private static instance: SliderController;

  constructor() {
    this.sliderService = new SliderService();
  }

  static getInstance(): SliderController {
    if (!SliderController.instance) {
      SliderController.instance = new SliderController();
    }
    return SliderController.instance;
  }

  async getAllSliders(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const sliders = await this.sliderService.getAllSliders(
        limit ? parseInt(limit as string) : undefined
      );
      const camelCaseSliders = sliders.map((slider) => toCamelCase(slider));
      res.json(camelCaseSliders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSliderById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const slider = await this.sliderService.getSliderById(id);
      if (!slider) {
        return res.status(404).json({ error: "Slider not found" });
      }
      const camelCaseSlider = toCamelCase(slider);
      res.json(camelCaseSlider);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createSlider(req: Request, res: Response) {
    try {
      const { sliderTitle, sliderDesc, sliderLink } = req.body;

      const snakeCaseData: any = {
        slider_title: sliderTitle,
        slider_desc: sliderDesc,
        slider_link: sliderLink,
        slider_image: getImagePath(req),
      };

      const newSlider = await this.sliderService.createSlider(snakeCaseData);
      const camelCaseSlider = toCamelCase(newSlider);
      res.status(201).json(camelCaseSlider);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSlider(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { sliderTitle, sliderDesc, sliderLink } = req.body;

      const existingSlider = await getExistingEntity<Slider>(
        this.sliderService, 
        'getSliderById', 
        id, 
        "Slider not found"
      );

      const sliderToUpdate: Partial<Slider> = {
        id,
        slider_title: sliderTitle,
        slider_desc: sliderDesc,
        slider_link: sliderLink,
      };

      const newImagePath = getImagePath(req);
      if (newImagePath) {
        if (existingSlider.slider_image) {
          await deleteFile(existingSlider.slider_image);
        }
        sliderToUpdate.slider_image = newImagePath;
      }

      const updatedSlider = await this.sliderService.updateSlider(id, sliderToUpdate);
      const camelCaseSlider = toCamelCase(updatedSlider);
      res.json(camelCaseSlider);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSlider(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const slider = await getExistingEntity<Slider>(
        this.sliderService, 
        'getSliderById', 
        id, 
        "Slider not found"
      );

      if (slider.slider_image) {
        await deleteFile(slider.slider_image);
      }

      await this.sliderService.deleteSlider(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}