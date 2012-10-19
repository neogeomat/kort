Ext.define('Kort.controller.Bugmap', {
    extend: 'Ext.app.Controller',

    config: {
        views: [
            'bugmap.BugMessageBox',
            'bugmap.NavigationView',
            'bugmap.Detail'
        ],
        refs: {
            mapCmp: '#bugmap',
            bugmapNavigationView: '#bugmapNavigationView'
        },
        control: {
            mapCmp: {
                maprender: 'onMapRender'
            }
        },

        map: null,
        ownPositionMarker: null,
        markerLayerGroup: [],
        confirmTemplate: null,
        activeBug: null
    },

    onMapRender: function(cmp, map, tileLayer) {
        var me = this;
        me.setMap(map);
        
        // adding markers
        if(cmp.getGeo()) {
            me.addOwnPositionMarker(cmp, map);

            // add listener for locationupdate event of geolocation for setting marker position
            cmp.getGeo().addListener('locationupdate', function() {
                me.setOwnPositionMarkerPosition(new L.LatLng(this.getLatitude(), this.getLongitude()));
            });
        }
        
        // TODO load bugs after each geoupdate event
        var bounds = map.getBounds();
        var bugsStore = Ext.getStore('Bugs');
        var url = './server/webservices/bug/bugs/bounds/' + bounds.getNorthEast().lat + ',' + bounds.getNorthEast().lng + '/' + bounds.getSouthWest().lat + ',' + bounds.getSouthWest().lng;
        bugsStore.getProxy().setUrl(url);
        
        // Load bugs store
		Ext.getStore('Bugs').load(function(records, operation, success) {
            Ext.each(records, function (item, index, length) {
                me.addMarker(item);
            });
        });
        
        me.getMarkerLayerGroup().addTo(map);
    },

    addOwnPositionMarker: function(cmp, map) {
        var iconWidth = 20,
            iconHeight = 20,
            icon,
            ownPositionMarker;

        icon = new L.Icon({
            iconUrl: './resources/images/marker_icons/own_position.png',
            iconSize: [iconWidth, iconHeight],
            iconAnchor: [(iconWidth/2), (iconHeight/2)]

        });
        ownPositionMarker = new L.Marker([cmp.getGeo().getLatitude(), cmp.getGeo().getLongitude()], {
            icon: icon,
            clickable: false
        });
        this.setOwnPositionMarker(ownPositionMarker);
        ownPositionMarker.addTo(map);
    },

    /**
     * Sets position of own position marker
     * @param latlng position of marker
     * @private
     */
    setOwnPositionMarkerPosition: function(latlng) {
        var ownPositionMarker = this.getOwnPositionMarker();
        if(ownPositionMarker) {
            ownPositionMarker.setLatLng(latlng);
        }
    },

    addMarker: function(item) {
        var me = this,
            icon,
            marker,
            tpl;
            
        icon = me.getIcon(item.get('type'));
        marker = L.marker([item.get('latitude'), item.get('longitude')], {
            //icon: icon
        });

        marker.bugdata = item;
        marker.on('click', me.onMarkerClick, me);
        me.getMarkerLayerGroup().addLayer(marker);
    },
    
    removeAllMarkers: function() {
        this.getMarkerLayerGroup().clearLayers();
    },
    
    onMarkerClick: function(e) {
        var tpl = this.getConfirmTemplate(),
            bugdata = e.target.bugdata;
        
        this.setActiveBug(bugdata);
        var bugMessageBox = new Kort.view.bugmap.BugMessageBox();
        var msg = bugMessageBox.confirm(bugdata.get('title'), tpl.apply(bugdata.data), this.markerConfirmHandler, this);
    },
    
    markerConfirmHandler: function(buttonId, value, opt) {
        if(buttonId === 'yes') {
            this.getBugmapNavigationView().push(Ext.create('Kort.view.bugmap.Detail', {
                bugdata: this.getActiveBug()
            }));
        }
        
        this.setActiveBug(null);
    },

    getIcon: function(type) {
        var iconWidth = 32,
            iconHeight = 37,
            shadowWidth = 51,
            shadowHeight = 37,
            icon;

        icon = new L.Icon({
            iconUrl: './resources/images/marker_icons/' + type + '.png',
            iconSize: [iconWidth, iconHeight],
            iconAnchor: [(iconWidth/2), iconHeight],
            shadowUrl: './resources/images/marker_icons/shadow.png',
            shadowSize: [shadowWidth, shadowHeight],
            shadowAnchor: [(iconWidth/2), shadowHeight],
            popupAnchor: [0, -(2*iconHeight/3)]
        });
        return icon;
    },
    
    init: function() {
        this.setConfirmTemplate(new Ext.XTemplate(
            '<div class="confirm-content">',
                '<p>{description}</p>',
            '</div>'
        ));
            
        // create layer group for bug markers
        this.setMarkerLayerGroup(L.layerGroup());
    }
});
