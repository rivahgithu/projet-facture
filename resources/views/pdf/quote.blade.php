<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Devis {{ $quote->quote_number }}</title>
    <style>
        @page {
            margin: 22px 26px 24px 26px;
            size: a4 portrait;
        }

        * {
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 10px;
            line-height: 1.35;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
        }

        td, th {
            padding: 0;
            vertical-align: top;
        }

        /* En-tête */
        .header-table {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        .company-name {
            font-size: 19px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
            letter-spacing: -0.3px;
        }

        .company-slogan {
            font-size: 9.5px;
            color: #64748b;
            font-weight: 500;
        }

        .company-contact {
            text-align: right;
            font-size: 9.5px;
            color: #475569;
            line-height: 1.55;
        }

        .contact-label {
            font-weight: 600;
            color: #334155;
        }

        /* Titre & Devis Meta */
        .title-table {
            margin-bottom: 14px;
        }

        .subtitle-commercial {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            margin-bottom: 2px;
        }

        .title-devis {
            font-size: 26px;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 6px 0;
            line-height: 1.1;
            letter-spacing: -0.5px;
        }

        .quote-number-label {
            font-size: 10.5px;
            font-weight: 800;
            color: #1e293b;
        }

        .quote-badge {
            display: inline-block;
            background-color: #e6f9f5;
            border: 1px solid #99f6e4;
            color: #0d9488;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 12px;
            border-radius: 14px;
            font-family: monospace;
            margin-left: 4px;
        }

        .meta-right {
            text-align: right;
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.6;
        }

        .meta-value {
            font-weight: 800;
            color: #0f172a;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 800;
        }

        .status-converti {
            background-color: #f3e8ff;
            border: 1px solid #d8b4fe;
            color: #7e22ce;
        }

        .status-accepte {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #047857;
        }

        .status-envoye {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
        }

        .status-brouillon {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #475569;
        }

        .status-refuse {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
        }

        /* Cartes Client et Validité */
        .cards-table {
            margin-bottom: 14px;
        }

        .card-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            min-height: 82px;
        }

        .card-title {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            margin-bottom: 4px;
        }

        .client-name {
            font-size: 12.5px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
        }

        .client-detail {
            font-size: 9.5px;
            color: #475569;
            line-height: 1.4;
        }

        /* Table des Prestations */
        .items-table {
            width: 100%;
            margin-bottom: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }

        .items-table thead th {
            background-color: #eaf4f7;
            color: #0f172a;
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
        }

        .items-table tbody td {
            padding: 8px 10px;
            font-size: 9.5px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }

        .items-table tbody tr:last-child td {
            border-bottom: none;
        }

        .item-desc {
            font-weight: 700;
            color: #0f172a;
        }

        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* Conditions & Totaux */
        .bottom-section {
            margin-bottom: 14px;
        }

        .conditions-box {
            padding-right: 12px;
        }

        .conditions-title {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .conditions-text {
            font-size: 9px;
            color: #475569;
            line-height: 1.45;
        }

        .quote-ref {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 5px;
            font-weight: 600;
        }

        .totals-card {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 14px;
        }

        .totals-row {
            margin-bottom: 4px;
            font-size: 9.5px;
        }

        .totals-label {
            color: #475569;
            font-weight: 600;
        }

        .totals-value {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
            font-family: monospace;
            font-size: 10px;
        }

        .totals-divider {
            border-top: 1px solid #cbd5e1;
            margin: 6px 0;
        }

        .total-ttc-label {
            font-size: 11px;
            font-weight: 900;
            color: #0f172a;
        }

        .total-ttc-value {
            font-size: 13.5px;
            font-weight: 900;
            color: #2563eb;
            text-align: right;
            font-family: monospace;
        }

        /* Signatures */
        .signatures-table {
            margin-bottom: 12px;
        }

        .signature-client-card {
            background-color: #f0fdfa;
            border: 1.5px dashed #93c5fd;
            border-radius: 8px;
            padding: 10px 12px;
            height: 98px;
        }

        .signature-company-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            height: 98px;
        }

        .sig-title {
            font-size: 8.5px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sig-mention {
            font-size: 8px;
            color: #64748b;
            font-style: italic;
            margin-top: 2px;
        }

        .sig-date-line {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 30px;
        }

        .sig-stamp {
            font-size: 12px;
            font-weight: 700;
            font-style: italic;
            color: #3b82f6;
            text-align: center;
            margin-top: 24px;
            font-family: 'Times New Roman', serif;
        }

        /* Footer épuré */
        .clean-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 8px;
            color: #64748b;
            text-align: left;
        }
    </style>
</head>
<body>

    <!-- EN-TÊTE : Entreprise & Coordonnées -->
    <table class="header-table">
        <tr>
            <!-- Logo & Nom de l'entreprise -->
            <td style="width: 55%; vertical-align: middle;">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" style="max-height: 48px; max-width: 170px; object-fit: contain; margin-bottom: 4px;" alt="Logo {{ $company->name }}"/>
                @endif
                <div class="company-name">{{ $company->name }}</div>
                @if($company->legal_name && $company->legal_name !== $company->name)
                    <div class="company-slogan">{{ $company->legal_name }}</div>
                @else
                    <div class="company-slogan">Solutions digitales & prestations de services</div>
                @endif
            </td>

            <!-- Coordonnées professionnelles -->
            <td style="width: 45%; vertical-align: middle;" class="company-contact">
                @if($company->address)
                    <div><span class="contact-label">Adresse :</span> {{ $company->address }}</div>
                @else
                    <div><span class="contact-label">Adresse :</span> Avenue Chardy, Plateau, Abidjan</div>
                @endif

                @if($company->tax_id)
                    <div><span class="contact-label">N° CC :</span> {{ $company->tax_id }}</div>
                @endif

                @if($company->email)
                    <div><span class="contact-label">Email :</span> {{ $company->email }}</div>
                @endif

                @if($company->phone)
                    <div><span class="contact-label">Tél :</span> {{ $company->phone }}</div>
                @endif
            </td>
        </tr>
    </table>

    <!-- TITRE & INFORMATIONS DU DEVIS -->
    <table class="title-table">
        <tr>
            <!-- Titre & Badge N° Devis -->
            <td style="width: 50%;">
                <div class="subtitle-commercial">PROPOSITION COMMERCIALE</div>
                <h1 class="title-devis">DEVIS</h1>
                <div>
                    <span class="quote-number-label">N° DEVIS :</span>
                    <span class="quote-badge">{{ $quote->quote_number }}</span>
                </div>
            </td>

            <!-- Dates & Statut -->
            <td style="width: 50%;" class="meta-right">
                <div style="margin-bottom: 2px;">
                    <span>Date d'émission : </span>
                    <span class="meta-value">
                        {{ $quote->issue_date ? \Carbon\Carbon::parse($quote->issue_date)->locale('fr')->isoFormat('D MMM YYYY') : '-' }}
                    </span>
                </div>
                <div style="margin-bottom: 4px;">
                    <span>Date de validité : </span>
                    <span class="meta-value">
                        {{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->locale('fr')->isoFormat('D MMM YYYY') : '-' }}
                    </span>
                </div>
                <div>
                    <span>Statut de l'offre : </span>
                    @php
                        $st = strtolower($quote->status ?? 'brouillon');
                        $statusClass = 'status-brouillon';
                        $statusLabel = ucfirst($st);

                        if ($st === 'converti') {
                            $statusClass = 'status-converti';
                            $statusLabel = 'Converti en Facture';
                        } elseif ($st === 'accepté' || $st === 'accepte') {
                            $statusClass = 'status-accepte';
                            $statusLabel = 'Accepté';
                        } elseif ($st === 'envoyé' || $st === 'envoye') {
                            $statusClass = 'status-envoye';
                            $statusLabel = 'Envoyé';
                        } elseif ($st === 'refusé' || $st === 'refuse') {
                            $statusClass = 'status-refuse';
                            $statusLabel = 'Refusé';
                        }
                    @endphp
                    <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- CARTES : Émis pour & Validité -->
    <table class="cards-table">
        <tr>
            <!-- Carte Client -->
            <td style="width: 49%;">
                <div class="card-box">
                    <div class="card-title">PROPOSITION ÉMISE POUR :</div>
                    <div class="client-name">{{ $client->name ?? 'Client' }}</div>
                    @if(!empty($client->company_name))
                        <div class="client-detail" style="font-weight: 600; color: #334155;">{{ $client->company_name }}</div>
                    @endif
                    @if(!empty($client->address))
                        <div class="client-detail">{{ $client->address }}</div>
                    @endif
                    @if(!empty($client->email))
                        <div class="client-detail">{{ $client->email }}</div>
                    @endif
                    @if(!empty($client->phone))
                        <div class="client-detail" style="font-family: monospace;">{{ $client->phone }}</div>
                    @endif
                </div>
            </td>

            <td style="width: 2%;"></td>

            <!-- Carte Validité du Document -->
            <td style="width: 49%;">
                <div class="card-box">
                    <div class="card-title">VALIDITÉ DU DOCUMENT :</div>
                    <div class="client-detail" style="margin-bottom: 3px;">
                        <span style="color: #64748b;">Date d'émission : </span>
                        <strong>{{ $quote->issue_date ? \Carbon\Carbon::parse($quote->issue_date)->locale('fr')->isoFormat('D MMM YYYY') : '-' }}</strong>
                    </div>
                    <div class="client-detail" style="margin-bottom: 4px;">
                        <span style="color: #64748b;">Date de validité : </span>
                        <strong>{{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->locale('fr')->isoFormat('D MMM YYYY') : '-' }}</strong>
                    </div>
                    <div class="client-detail">
                        <span style="color: #64748b;">Statut de l'offre : </span>
                        <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- TABLEAU DES PRESTATIONS -->
    <table class="items-table">
        <thead>
            <tr>
                <th class="text-left" style="width: 44%;">DÉSIGNATION DE LA PRESTATION</th>
                <th class="text-center" style="width: 14%;">QTÉ</th>
                <th class="text-right" style="width: 16%;">PRIX UNITAIRE</th>
                <th class="text-center" style="width: 10%;">TAXE</th>
                <th class="text-right" style="width: 16%;">TOTAL HT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
                <tr>
                    <td class="text-left">
                        <div class="item-desc">{{ $item->description }}</div>
                    </td>
                    <td class="text-center" style="font-family: monospace;">
                        {{ (float) $item->quantity == (int) $item->quantity ? (int) $item->quantity : number_format($item->quantity, 2, ',', ' ') }}
                        <span style="font-size: 8px; color: #64748b;">{{ $item->unit ?: '' }}</span>
                    </td>
                    <td class="text-right" style="font-family: monospace;">
                        {{ number_format((float) $item->unit_price, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}
                    </td>
                    <td class="text-center" style="font-family: monospace;">
                        {{ (float) $item->tax_rate }}%
                    </td>
                    <td class="text-right" style="font-family: monospace; font-weight: 700;">
                        {{ number_format((float) $item->line_total, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="padding: 16px; color: #94a3b8;">
                        Aucune prestation enregistrée sur ce devis.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- CONDITIONS & TOTAUX -->
    <table class="bottom-section">
        <tr>
            <!-- Conditions de l'offre -->
            <td style="width: 53%;" class="conditions-box">
                <div class="conditions-title">CONDITIONS DE L'OFFRE :</div>
                <div class="conditions-text">
                    @if(!empty($quote->notes))
                        {!! nl2br(e($quote->notes)) !!}
                    @else
                        Conditions : Proposition commerciale valable {{ $company->payment_terms ?: 7 }} jours. Acompte de 40% au démarrage des travaux, solde à la livraison conforme.
                    @endif
                </div>
                <div class="quote-ref">Réf. devis : {{ $quote->quote_number }}</div>
            </td>

            <td style="width: 3%;"></td>

            <!-- Totaux HT, TVA, TTC -->
            <td style="width: 44%;">
                <div class="totals-card">
                    <table style="width: 100%;">
                        <tr class="totals-row">
                            <td class="totals-label">Sous-total HT</td>
                            <td class="totals-value">{{ number_format((float) $quote->subtotal, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}</td>
                        </tr>
                        @if((float) $quote->discount_total > 0)
                            <tr class="totals-row">
                                <td class="totals-label" style="color: #ea580c;">Remise commerciale</td>
                                <td class="totals-value" style="color: #ea580c;">-{{ number_format((float) $quote->discount_total, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}</td>
                            </tr>
                        @endif
                        <tr class="totals-row">
                            <td class="totals-label">TVA (18%)</td>
                            <td class="totals-value">{{ number_format((float) $quote->tax_total, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><div class="totals-divider"></div></td>
                        </tr>
                        <tr>
                            <td class="total-ttc-label">TOTAL TTC</td>
                            <td class="total-ttc-value">{{ number_format((float) $quote->total, 0, ',', ' ') }} {{ $quote->currency ?: 'FCFA' }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- SECTION SIGNATURES -->
    <table class="signatures-table">
        <tr>
            <!-- Pour acceptation et bon pour commande -->
            <td style="width: 49%;">
                <div class="signature-client-card">
                    <div class="sig-title">POUR ACCEPTATION ET BON POUR COMMANDE :</div>
                    <div class="sig-mention">Mention manuscrite obligatoire : « Bon pour accord et validation de l'offre ».</div>
                    <div class="sig-date-line">
                        Date &amp; Heure : {{ now()->format('d/m/Y') }} à {{ now()->format('H:i') }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature &amp; Cachet Client :
                    </div>
                </div>
            </td>

            <td style="width: 2%;"></td>

            <!-- Pour l'entreprise émettrice (dynamique selon le compte) -->
            <td style="width: 49%;">
                <div class="signature-company-card">
                    <div class="sig-title">POUR {{ strtoupper($company->name) }} :</div>
                    <div class="sig-mention" style="color: #475569; font-style: normal; font-weight: 500;">La Direction Commerciale & Technique</div>
                    <div class="sig-stamp">Cachet & Visa de validation</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- PIED DE PAGE ÉPURÉ (SANS les éléments décoratifs entourés en rouge) -->
    <table class="clean-footer">
        <tr>
            <td style="width: 75%;">
                <strong>{{ $company->legal_name ?: $company->name }}</strong> &bull; Votre partenaire de confiance pour la gestion commerciale.
            </td>
            <td style="width: 25%; text-align: right; color: #94a3b8;">
                {{ $quote->quote_number }}
            </td>
        </tr>
    </table>

</body>
</html>
