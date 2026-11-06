export const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    USER: 'user',
    DRIVER: 'driver',
    STORE: 'store'
});

export const PRODUCT_STATUS = Object.freeze({
    AVAILABLE: 'available',
    OUT_OF_STOCK: 'out_of_stock',
    INACTIVE: 'inactive'
});

export const ORDER_STATUS = Object.freeze({
    CREATED: 'created',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
});

export const DELIVERY_STATUS = Object.freeze({
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered'
});

export const ORDER_PRIORITY = Object.freeze({
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high'
});

export const MOCK_SEED = Object.freeze({
    MAX : 50,
    DEFAULT: 'default'
});


/**
 * constantes relacionadas con la carga de archivos
 */
export const UPLOAD_LIMITS = Object.freeze({
    DOCUMENT: 5 * 1024 * 1024, // 5MB
    RECEIPT: 5 * 1024 * 1024, // 5MB
    PROOF: 5 * 1024 * 1024 // 5MB
});

export const ALLOWED_MIME_TYPES = Object.freeze([
    'application/pdf',
    'image/png',
    'image/jpeg'
]);

export const ALLOWED_EXTENSIONS = Object.freeze([
    '.pdf', '.png', '.jpg', '.jpeg'
]);

export const VALID_DOCUMENT_TYPES = Object.freeze([
    'dni',
    'cuit',
    'pasaporte',
    'licencia',
    'driver_license',
    'cedula',
    'comprobante',
    'factura',
    'recibo'
]);

export const UPLOAD_SETTINGS = Object.freeze({
    DEFAULT_FIELD_NAME: 'document',
    DEFAULT_MAX_SIZE: UPLOAD_LIMITS.DOCUMENT,
    DEFAULT_ALLOWED_MIME_TYPES: ALLOWED_MIME_TYPES,
    DEFAULT_ALLOWED_EXTENSIONS: ALLOWED_EXTENSIONS,
    DEFAULT_VALID_DOCUMENT_TYPES: VALID_DOCUMENT_TYPES
});