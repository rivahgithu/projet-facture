<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message de contact</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6fa;
            color: #1e293b;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            padding: 30px 40px;
            text-align: center;
            color: #ffffff;
        }
        .brand-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 35px 40px;
        }
        .intro {
            font-size: 15px;
            color: #475569;
            margin-bottom: 25px;
        }
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 700;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 3px;
        }
        .info-value {
            color: #0f172a;
            font-size: 15px;
            font-weight: 600;
        }
        .message-box {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #4f46e5;
            border-radius: 8px;
            padding: 18px 20px;
            margin-top: 15px;
            font-size: 15px;
            color: #1e293b;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .btn-reply {
            display: inline-block;
            background: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            text-align: center;
            margin-top: 25px;
        }
        .footer {
            background: #f8fafc;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand-badge">Rivah Facture</div>
            <h1>Nouveau message de contact</h1>
        </div>

        <div class="content">
            <p class="intro">
                Un visiteur a soumis le formulaire de contact sur votre site web <strong>Rivah Facture</strong>. Voici les détails de son message :
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Expéditeur (Nom)</span>
                    <span class="info-value">{{ $data['name'] }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Adresse Email</span>
                    <span class="info-value">
                        <a href="mailto:{{ $data['email'] }}" style="color: #4f46e5; text-decoration: none;">
                            {{ $data['email'] }}
                        </a>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sujet de la demande</span>
                    <span class="info-value">{{ $data['subject'] }}</span>
                </div>
            </div>

            <div>
                <span class="info-label">Message du client</span>
                <div class="message-box">{{ $data['message'] }}</div>
            </div>

            <div style="text-align: center;">
                <a href="mailto:{{ $data['email'] }}?subject=Re: {{ rawurlencode($data['subject']) }}" class="btn-reply">
                    Répondre à {{ $data['name'] }}
                </a>
            </div>
        </div>

        <div class="footer">
            Cet email a été envoyé automatiquement depuis le formulaire de contact de <strong>Rivah Facture</strong>.
        </div>
    </div>
</body>
</html>
