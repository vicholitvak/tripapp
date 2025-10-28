/**
 * Registro centralizado de seeds
 *
 * Esto resuelve problemas con imports dinámicos en API routes
 */

import { seedCasaVoyage } from './seedCasaVoyage';
import { seedTierraGres } from './seedTierraGres';
import { seedJoyasRelmu } from './seedJoyasRelmu';
import { seedAtacamaDarkSky } from './seedAtacamaDarkSky';

export interface SeedFunction {
  (): Promise<any>;
}

export interface SeedRegistry {
  [key: string]: SeedFunction;
}

/**
 * Registro de todas las funciones de seed disponibles
 */
export const seedRegistry: SeedRegistry = {
  // Kebab-case keys matching the seed names
  'casa-voyage': seedCasaVoyage,
  'casavoyage': seedCasaVoyage,
  'CasaVoyage': seedCasaVoyage,

  'tierra-gres': seedTierraGres,
  'tierragres': seedTierraGres,
  'TierraGres': seedTierraGres,

  'joyas-relmu': seedJoyasRelmu,
  'joyasrelmu': seedJoyasRelmu,
  'JoyasRelmu': seedJoyasRelmu,

  'atacama-dark-sky': seedAtacamaDarkSky,
  'atacamadarksky': seedAtacamaDarkSky,
  'AtacamaDarkSky': seedAtacamaDarkSky,
};

/**
 * Obtener función de seed por nombre
 */
export function getSeedFunction(seedName: string): SeedFunction | null {
  // Normalizar el nombre
  const normalizedName = seedName.toLowerCase().replace(/[-_\s]/g, '');

  // Buscar en el registro
  for (const [key, fn] of Object.entries(seedRegistry)) {
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
    if (normalizedKey === normalizedName) {
      return fn;
    }
  }

  return null;
}

/**
 * Listar todos los seeds disponibles
 */
export function listAvailableSeeds(): string[] {
  return [
    'casa-voyage',
    'tierra-gres',
    'joyas-relmu',
    'atacama-dark-sky',
  ];
}

/**
 * Verificar si un seed existe
 */
export function seedExists(seedName: string): boolean {
  return getSeedFunction(seedName) !== null;
}
