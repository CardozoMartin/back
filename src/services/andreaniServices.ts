// services/andreaniService.ts
import axios from 'axios';

interface ShippingCalculationParams {
  weight: number;
  width: number;
  height: number;
  length: number;
}

interface AndreaniResponse {
  total: number;
  estimatedDays: number;
  estimatedDeliveryDate: string;
}

interface TrackingEvent {
  fecha: string;
  estado: string;
  descripcion: string;
  sucursal: string;
}

interface TrackingResponse {
  estado: string;
  numeroEnvio: string;
  eventos: TrackingEvent[];
}

class AndreaniService {
  private readonly BASE_URL = 'https://apis.andreani.com';
  private readonly API_KEY: string;
  private readonly BRANCH_CODE: string;

  constructor() {
    this.API_KEY = process.env.ANDREANI_API_KEY || '';
    this.BRANCH_CODE = process.env.ANDREANI_BRANCH_CODE || '';
  }

  async calculateShipping(
    postalCode: string, 
    params: ShippingCalculationParams
  ): Promise<AndreaniResponse> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/v2/tarifas`,
        {
          cpDestino: postalCode,
          peso: params.weight,
          volumen: (params.width * params.height * params.length) / 1000000,
          valorDeclarado: 0,
          sucursalOrigen: this.BRANCH_CODE
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.API_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error en el cálculo del envío:', error);
      throw new Error('No se pudo calcular el costo del envío');
    }
  }

  async trackOrder(trackingNumber: string): Promise<TrackingResponse> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/v2/envios/${trackingNumber}`,
        {
          headers: {
            'apikey': this.API_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al rastrear el envío:', error);
      throw new Error('No se pudo obtener la información de rastreo');
    }
  }

  async createShipment(orderData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/v2/envios`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.API_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al crear el envío:', error);
      throw new Error('No se pudo crear el envío');
    }
  }
}

export default new AndreaniService();