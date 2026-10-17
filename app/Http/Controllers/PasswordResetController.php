<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    /**
     * Affiche le formulaire de demande de lien de réinitialisation.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Traite l'envoi du lien de réinitialisation par email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Veuillez saisir votre adresse e-mail.',
            'email.email' => 'Veuillez saisir une adresse e-mail valide.',
        ]);

        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );
        } catch (\Throwable $e) {
            Log::error('Erreur SMTP lors de la réinitialisation de mot de passe: '.$e->getMessage());

            return back()->withErrors([
                'email' => "Impossible d'envoyer l'e-mail pour le moment. Veuillez vérifier la connexion ou réessayer plus tard.",
            ]);
        }

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', 'Un e-mail contenant le lien de réinitialisation vient de vous être envoyé. Vérifiez votre boîte de réception.');
        }

        return back()->withErrors([
            'email' => "Aucun compte n'est associé à cette adresse e-mail.",
        ]);
    }

    /**
     * Affiche le formulaire de définition du nouveau mot de passe.
     */
    public function edit(Request $request, string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Enregistre le nouveau mot de passe de l'utilisateur.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'token.required' => 'Le jeton de sécurité est manquant.',
            'email.required' => "L'adresse e-mail est obligatoire.",
            'password.required' => 'Veuillez renseigner un nouveau mot de passe.',
            'password.min' => 'Le mot de passe doit comporter au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
        }

        return back()->withErrors([
            'email' => 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.',
        ]);
    }
}
