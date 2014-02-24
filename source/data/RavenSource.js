enyo.kind({
    name: 'RavenSource',
    kind: 'enyo.AjaxSource',

    urlRoot: 'http://undefined'

});

enyo.kind({
    name: 'Raven.Document',
    kind: 'enyo.Model',
    defaultSource: 'raven',
    primaryKey: 'id',

	mixins:[ enyo.ComputedSupport ],

    computed:{
        id:['@metadata']
    },

    id: function() {
        var metadata = this.get('@metadata');
        if(metadata)
            return metadata['@id'];
    },

    requestKind: 'RavenBrowser.BatchLoader',

    attributes:{
        database: 'TestDB'
    },

    getUrl: function() {
        return [this.get('database'), this.get('source')].join('/');
    }
});

enyo.kind({
    name: 'Raven.DocumentCollection',
    kind: 'enyo.Collection',
    model: 'Raven.Document',
    defaultSource: 'raven',

    attributes:{
        tenantId:null
    },

    getUrl: function() {
        return "/databases/"+this.get('tenantId')+"/indexes/Raven/DocumentsByEntityName";
    },

    parse: function(data) {
        var tenantId = this.get('tenantId');
        data.Results.forEach(function(d) {
            d['@tenantId'] = tenantId;
        });
        return data.Results;
    }
});
