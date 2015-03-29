/*******************************************************************************
 * Drug search form
 ******************************************************************************/
var DrugSearchResultItem = Backbone.Model.extend({});

var DrugSearchResult = Backbone.Collection.extend({
  model: DrugSearchResultItem
});

var DrugSearchResultItemView = Marionette.ItemView.extend({
  model: DrugSearchResultItem,
  template: '#DrugSearchResultItemViewTpl',
  attributes: {
    class: 'search-result search-result-drug'
  },
  triggers: {
    'click': 'selectdrug'
  }
});

var DrugSearchResultView = Marionette.CompositeView.extend({
  template: '#DrugSearchResultTpl',
  childViewContainer: '.wrapper',
  childView: DrugSearchResultItemView,
  ui: {
    searchField: '#SearchDrugInput'
  },
  events: {
    'keyup @ui.searchField': 'onKeyUp'
  },
  onKeyUp: function(e) {
    var self = this;
    var q = self.ui.searchField.val();

    if (q.length >= 3) {
      self.q = q + "*";
      setTimeout(function(){
        search('drugs', self.q, self.onSearchResult.bind(self));
      }, 300);
    } else {
      self.q = null;
      self.collection.reset();
    }
  },
  onSearchResult: function(result) {
    if (result.responseHeader.params.q === this.q) {
      this.collection.set(result.response.docs);
    }
  }
});

/*******************************************************************************
 * Cares search form
 ******************************************************************************/

var CareSearchResultItem = Backbone.Model.extend({});

var CareSearchResult = Backbone.Collection.extend({
  model: CareSearchResultItem
});

var CareSearchResultItemView = Marionette.ItemView.extend({
  model: CareSearchResultItem,
  template: '#CareSearchResultItemViewTpl',
  attributes: {
    class: 'search-result search-result-care'
  },
  triggers: {
    'click': 'selectcare'
  }
});

var CareSearchResultView = Marionette.CompositeView.extend({
  childView: CareSearchResultItemView,
  template: '#CareSearchResultViewTpl',
  childViewContainer: '.wrapper',
  ui: {
    searchField: '#SearchCareInput'
  },
  events: {
    'keyup @ui.searchField': 'onKeyUp'
  },
  onKeyUp: function(e) {

    var self = this;
    var q = $(this.ui.searchField).val();

    if (q.length >= 5) {
      self.q = q + "*";
      setTimeout(function(){
        search('cares', self.q, self.onSearchResult.bind(self));
      }, 300);
    } else {
      self.q = null;
      self.collection.reset();
    }
  },
  onSearchResult: function(result) {
    if (result.responseHeader.params.q === this.q) {
      this.collection.set(result.response.docs);
    }
  }
});

/*******************************************************************************
 * Marionette application
 ******************************************************************************/
var Raphael = Marionette.Application.extend({

  initialize: function(options) {

    this.drugResult = new DrugSearchResult();

    this.drugResultView = new DrugSearchResultView({
      collection: this.drugResult
    });

    this.drugResultView.on('childview:selectdrug', function(evt, childView){
      var drug = childView.model;
      alert('Selected ' + drug.get('farmaco')[0]);
    });

    this.careResult = new CareSearchResult();

    this.careResultView = new CareSearchResultView({
      collection: this.careResult
    });

    this.careResultView.on('childview:selectcare', function(evt, childView){
      var care = childView.model;
      alert('Selected ' + care.get('descrizione') + ', branca ' + care.get('branca'));
    });
  },

  onStart: function(options) {
    setUpTheme();

    this.drugResultView.setElement($('#SearchDrugContainer'));
    this.drugResultView.render();

    this.careResultView.setElement($('#SearchCareContainer'));
    this.careResultView.render();
  }

});


/*******************************************************************************
 * Misc functions
 ******************************************************************************/
function setUpTheme() {
  $('[data-toggle="checkbox"]').radiocheck();
}

/**
 * searchStr is user-entered text, transformed into a Lucene query and submitted
 * to Solr
 */
function search(solrCore, q, callback) {
  $.ajax({
    method: 'get',
    url: '/search',
    data: {
      core: solrCore,
      q: q
    },
    dataType: 'json'
  })
  .done(function(result){
    callback(result);
  })
  .fail(function(err){
    alert(err);
  });
}
