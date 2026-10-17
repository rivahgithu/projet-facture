export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Company {
    id: number;
    name: string;
    legal_name?: string;
    email: string;
    phone: string;
    address: string;
    logo_url?: string;
    currency: string;
    payment_terms: number; // days
    invoice_prefix: string;
    quote_prefix: string;
    tax_id?: string;
}

export interface Client {
    id: number;
    name: string;
    company_name?: string;
    email: string;
    phone: string;
    address: string;
    tax_id?: string;
    notes?: string;
    is_archived?: boolean;
    created_at: string;
    total_invoiced: number;
    total_paid: number;
    balance_due: number;
}

export interface Product {
    id: number;
    name: string;
    reference?: string;
    description: string;
    unit: string;
    unit_price: number;
    tax_rate: number;
    is_active: boolean;
}

export interface DocumentItem {
    id: string;
    product_id?: number;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_rate: number;
    tax_rate: number;
    line_total: number;
}

export type QuoteStatus = 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'expiré' | 'converti';

export interface Quote {
    id: number;
    quote_number: string;
    client_id: number;
    client_name: string;
    status: QuoteStatus;
    issue_date: string;
    valid_until: string;
    currency: string;
    items: DocumentItem[];
    subtotal: number;
    discount_total: number;
    tax_total: number;
    total: number;
    notes?: string;
    converted_invoice_id?: number;
}

export type InvoiceDocumentStatus = 'brouillon' | 'émise' | 'annulée';
export type PaymentStatus = 'non_payée' | 'partiellement_payée' | 'payée' | 'en_retard';

export interface Payment {
    id: number;
    invoice_id: number;
    amount: number;
    payment_date: string;
    method: 'espèces' | 'virement' | 'chèque' | 'mobile_money';
    reference?: string;
    notes?: string;
    recorded_by: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    client_id: number;
    client_name: string;
    client_email: string;
    client_address: string;
    quote_id?: number;
    document_status: InvoiceDocumentStatus;
    payment_status: PaymentStatus;
    issue_date: string;
    due_date: string;
    currency: string;
    items: DocumentItem[];
    subtotal: number;
    discount_total: number;
    tax_total: number;
    total: number;
    amount_paid: number;
    balance_due: number;
    notes?: string;
    payments: Payment[];
}

export interface DashboardStats {
    total_facture: number;
    total_encaisse: number;
    solde_restant: number;
    factures_en_retard_count: number;
    factures_en_retard_amount: number;
    devis_en_attente_count: number;
}
