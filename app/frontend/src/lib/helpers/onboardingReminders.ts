import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OnboardingProgress } from '@/types/provider';
import { NotificationService } from '@/lib/services/notificationService';

/**
 * Helper para enviar recordatorios de onboarding incompleto
 *
 * Este script se puede ejecutar periódicamente (ej: diario mediante cron job)
 * para enviar recordatorios a proveedores que no han completado su registro.
 */
export class OnboardingReminders {
  /**
   * Envía recordatorios a todos los onboardings incompletos
   */
  static async sendReminders(): Promise<{
    sent: number;
    expired: number;
    errors: number;
  }> {
    const stats = {
      sent: 0,
      expired: 0,
      errors: 0,
    };

    try {
      // Obtener todos los onboarding en progreso
      const q = query(
        collection(db, 'onboardingProgress')
      );

      const snapshot = await getDocs(q);
      const now = new Date();

      for (const docSnap of snapshot.docs) {
        try {
          const progress = docSnap.data() as OnboardingProgress;

          // Verificar si ya completó todos los pasos
          if (progress.completedSteps.length >= progress.totalSteps) {
            continue;
          }

          // Calcular días restantes
          const expiresAt = progress.expiresAt instanceof Timestamp
            ? progress.expiresAt.toDate()
            : new Date(progress.expiresAt);

          const daysRemaining = Math.ceil(
            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Si ya expiró
          if (daysRemaining <= 0) {
            await NotificationService.notifyOnboardingExpired(
              progress.userId,
              progress.draftData.businessInfo?.name || 'tu negocio'
            );
            stats.expired++;
            continue;
          }

          // Enviar recordatorio si faltan 7, 3, 2 o 1 día
          if ([7, 3, 2, 1].includes(daysRemaining)) {
            await NotificationService.notifyOnboardingIncomplete(
              progress.userId,
              progress.draftData.businessInfo?.name || 'tu negocio',
              daysRemaining
            );
            stats.sent++;
          }
        } catch (error) {
          console.error('Error processing onboarding:', docSnap.id, error);
          stats.errors++;
        }
      }
    } catch (error) {
      console.error('Error sending onboarding reminders:', error);
    }

    return stats;
  }

  /**
   * Obtiene lista de onboardings que necesitan atención
   */
  static async getIncompleteOnboardings(): Promise<{
    expiring: OnboardingProgress[];
    expired: OnboardingProgress[];
  }> {
    const result = {
      expiring: [] as OnboardingProgress[],
      expired: [] as OnboardingProgress[],
    };

    try {
      const q = query(
        collection(db, 'onboardingProgress')
      );

      const snapshot = await getDocs(q);
      const now = new Date();

      snapshot.docs.forEach((docSnap) => {
        const progress = docSnap.data() as OnboardingProgress;

        // Skip completed
        if (progress.completedSteps.length >= progress.totalSteps) {
          return;
        }

        const expiresAt = progress.expiresAt instanceof Timestamp
          ? progress.expiresAt.toDate()
          : new Date(progress.expiresAt);

        const daysRemaining = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining <= 0) {
          result.expired.push(progress);
        } else if (daysRemaining <= 3) {
          result.expiring.push(progress);
        }
      });
    } catch (error) {
      console.error('Error getting incomplete onboardings:', error);
    }

    return result;
  }

  /**
   * Envía recordatorio manual a un usuario específico
   */
  static async sendManualReminder(
    userId: string,
    businessName: string,
    daysRemaining: number
  ): Promise<void> {
    try {
      if (daysRemaining <= 0) {
        await NotificationService.notifyOnboardingExpired(userId, businessName);
      } else {
        await NotificationService.notifyOnboardingIncomplete(
          userId,
          businessName,
          daysRemaining
        );
      }
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      throw error;
    }
  }
}

/**
 * Función que se puede ejecutar en un cron job
 * Ejemplo de uso en Vercel Cron Jobs o similar
 */
export async function sendDailyOnboardingReminders() {
  console.log('📅 Running daily onboarding reminders...');

  const stats = await OnboardingReminders.sendReminders();

  console.log('✅ Reminders sent:', stats.sent);
  console.log('⏰ Onboardings expired:', stats.expired);
  console.log('❌ Errors:', stats.errors);

  return stats;
}
