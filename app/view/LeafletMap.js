/**
 * LeafletMap component
 */
Ext.define('Kort.view.LeafletMap', {
    extend: 'Ext.ux.LeafletMap',
    xtype: 'kortleafletmap',

    config: {
        useCurrentLocation: false,
        autoMapCenter: false,
        enableOwnPositionMarker: true,
        mapOptions: {
            zoom: Kort.util.Config.getLeafletMap().zoom
        },
        tileLayerUrl: Kort.util.Config.getLeafletMap().tileLayerUrl,
        tileLayerOptions: {
            apikey: Kort.util.Config.getLeafletMap().apiKey,
            styleId: Kort.util.Config.getLeafletMap().styleId,
            attribution: Kort.util.Config.getLeafletMap().tileLayerAttribution
        }
    }
});
