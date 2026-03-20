/**
 * Mapeo de Barrios a Comunas para Valledupar, Cesar, Colombia
 */
export const GEOGRAFIA_VALLEDUPAR = {
    // COMUNA 1 (Norte/Centro)
    'Centro': '1',
    'San Jorge': '1',
    'La Garita': '1',
    'Altagracia': '1',
    'Loperena': '1',
    'Nueve de Marzo': '1',

    // COMUNA 2 (Nororiente)
    '12 de Octubre': '2',
    'Simón Bolívar': '2',
    'Mayales': '2',
    'Los Cocos': '2',
    'San Antonio': '2',
    'La Granja': '2',
    'Villa del Rosario': '2',

    // COMUNA 3 (Sur/Suroccidente)
    'Villa Corelca': '3',
    'Ciudadela 450 Años': '3',
    'Mareigua': '3',
    'El Páramo': '3',
    'Siete de Agosto': '3',
    'San Fernando': '3',
    'Don Alberto': '3',
    'La Nevada': '3', // A veces asociada a la 5, pero común aquí

    // COMUNA 4 (Occidente)
    'El Cerrito': '4',
    'Fundadores': '4',
    'Dangond': '4',
    'Sabanitas': '4',
    'Cisneros': '4',
    'La Victoria': '4',
    'Jorge Dangond': '4',

    // COMUNA 5 (Noroccidente)
    'La Popa': '5',
    'Bello Horizonte': '5',
    'Los Cortijos': '5',
    'Arizona': '5',
    'Las Flores': '5',
    'Villa Miriam': '5',
    'Francisco de Paula Santander': '5',

    // COMUNA 6 (Norte)
    'San Joaquín': '6',
    'Los Músicos': '6',
    'Amaneceres del Valle': '6',
    'Los Campanos': '6',
    'El Amparo': '6',
};

export const LISTA_BARRIOS = Object.keys(GEOGRAFIA_VALLEDUPAR).sort();

export const getComunaByBarrio = (barrio) => {
    return GEOGRAFIA_VALLEDUPAR[barrio] || '';
};
