<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

            return (new MailMessage)
                ->subject('Réinitialisation de votre mot de passe - Rivah Facture')
                ->greeting('Bonjour '.($notifiable->name ?? '').',')
                ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Rivah Facture.')
                ->action('Réinitialiser mon mot de passe', $url)
                ->line('Ce lien expirera dans 60 minutes.')
                ->line('Si vous n\'avez pas demandé cette réinitialisation, aucune action supplémentaire n\'est requise.')
                ->salutation("Cordialement,\nL'équipe Rivah Facture");
        });
    }
}
