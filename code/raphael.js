/*******************************************************************************
 * Prescriptions
 ******************************************************************************/
var Patient = Backbone.Model.extend({});

var NoPrescription = Backbone.Model.extend({
  defaults: {
    ptype: 'no'
  }
});

var DrugPrescription = Backbone.Model.extend({
  defaults: {
    ptype: 'drug'
  }
});

var CarePrescription = Backbone.Model.extend({
  defaults: {
    ptype: 'care'
  }
});

var Session = Backbone.Model.extend({});

/**
 * A polymorphic collection of prescriptions. Prescriptions are identified by the
 * "ptype" property:
 * - drug
 * - care
 */
var Prescriptions = Backbone.Collection.extend({
  model: function(attrs, options) {
    var ptype = attrs.ptype;
    switch (ptype) {
      case 'drug': return DrugPrescription;
      case 'care': return CarePrescription;
      default: throw 'This collections can\'t contain ptype: ' + ptype;
    }
  },
  initialize: function() {
    this.on('remove', this.updateChildCounter);
    this.on('add', this.updateChildCounter);
  },
  updateChildCounter: function() {
    var size = this.size();
    this.each(function(p, index){
      p.set('counter', index + 1);
      p.set('total', size);
    });
  }
});

var DrugLine = Backbone.Model.extend({
  defaults: {
    quantity: 1
  },
  incrementQuantity: function() {
    this.set('quantity', this.get('quantity') + 1);
  },
  decrementQuantity: function() {
    this.set('quantity', this.get('quantity') - 1);
  }
});

var DrugLines = Backbone.Collection.extend({
  model: DrugLine
});

var DrugLineView = Marionette.ItemView.extend({
  model: DrugLine,
  template: "#DrugLineViewTpl",
  attributes: {
    class: 'prescription-line'
  },
  ui: {
    increment: '.increment',
    decrement: '.decrement'
  },
  modelEvents: {
    'change:quantity': 'render'
  },
  events: {
    'click @ui.increment': 'incrementQuantity',
    'click @ui.decrement': 'decrementQuantity'
  },
  incrementQuantity: function() {
    this.model.incrementQuantity();
  },
  decrementQuantity: function() {
    if (this.model.get('quantity') > 1) {
      this.model.decrementQuantity();
    } else {
      this.trigger('remove:line');
    }
  }
});

var DrugPrescriptionView = Marionette.CompositeView.extend({
  model: DrugPrescription,
  template: '#DrugPrescriptionViewTpl',
  childView: DrugLineView,
  childViewContainer: '.lines',
  initialize: function(options){
    this.collection = new DrugLines();
  },
  modelEvents: {
    'change:counter': 'render',
    'change:total': 'render'
  },
  onRender: function() {
    setUpTheme(this.$el);
  },
  ui: {
    searchBtn: '.search',
    removeBtn: '.removeBtn'
  },
  events: {
    'click @ui.searchBtn': 'showSearchBox'
  },
  childEvents: {
    'remove:line': function(line) {
      this.collection.remove(line.model);
    }
  },
  triggers: {
    'click @ui.removeBtn': 'removeprescription'
  },
  showSearchBox: function() {
    var self = this;

    var drugResult = new DrugSearchResult();

    var drugResultView = new DrugSearchResultView({
      collection: drugResult
    });

    var box = bootbox.dialog({
      title: 'Cerca un farmaco nel prontuario',
      message: drugResultView.$el,
      buttons: {
        close: {
          label: "Chiudi",
          className: "btn-primary",
        }
      }
    });

    drugResultView.on('childview:selectdrug', function(evt, childView){
      self.collection.add(new DrugLine({
        drug: childView.model
      }));
      box.modal('hide');
    });

    box.on('shown.bs.modal', function () {
      drugResultView.focusSearchField();
    });

    drugResultView.render();
  }
});

var CareLine = Backbone.Model.extend({
  defaults: {
    quantity: 1
  },
  incrementQuantity: function() {
    this.set('quantity', this.get('quantity') + 1);
  },
  decrementQuantity: function() {
    this.set('quantity', this.get('quantity') - 1);
  }
});

var CareLines = Backbone.Collection.extend({
  model: CareLine
});

var CareLineView = Marionette.ItemView.extend({
  model: CareLine,
  template: '#CareLineViewTpl',
  attributes: {
    class: 'prescription-line'
  },
  ui: {
    increment: '.increment',
    decrement: '.decrement'
  },
  modelEvents: {
    'change:quantity': 'render'
  },
  events: {
    'click @ui.increment': 'incrementQuantity',
    'click @ui.decrement': 'decrementQuantity'
  },
  incrementQuantity: function() {
    this.model.incrementQuantity();
  },
  decrementQuantity: function() {
    if (this.model.get('quantity') > 1) {
      this.model.decrementQuantity();
    } else {
      this.trigger('remove:line');
    }
  }
});

var CarePrescriptionView = Marionette.CompositeView.extend({
  model: CarePrescription,
  template: '#CarePrescriptionViewTpl',
  childView: CareLineView,
  childViewContainer: '.lines',
  initialize: function(options){
    this.collection = new CareLines();
  },
  ui: {
    searchBtn: '.searchBtn',
    removeBtn: '.removeBtn'
  },
  modelEvents: {
    'change:counter': 'render',
    'change:total': 'render'
  },
  childEvents: {
    'remove:line': function(line) {
      this.collection.remove(line.model);
    }
  },
  events: {
    'click @ui.searchBtn': 'onSearchButtonClick'
  },
  triggers: {
    'click @ui.removeBtn': 'removeprescription'
  },
  onSearchButtonClick: function() {
    var self = this;

    var careResult = new CareSearchResult();

    var careResultView = new CareSearchResultView({
      collection: careResult
    });

    var box = bootbox.dialog({
      title: 'Cerca nel nomenclatore',
      message: careResultView.$el,
      buttons: {
        close: {
          label: "Chiudi",
          className: "btn-primary",
        }
      }
    });

    careResultView.on('childview:selectcare', function(evt, childView){
      self.collection.add(new CareLine({
        care: childView.model
      }));
      box.modal('hide');
    });

    box.on('shown.bs.modal', function () {
      careResultView.focusSearchField();
    });

    careResultView.render();
  },
  onRender: function() {
    setUpTheme(this.$el);
  }
});

var PrescriptionsView = Marionette.CompositeView.extend({
  template: '#PrescriptionsViewTpl',
  childViewContainer: '.container',
  getChildView: function(model) {
    var ptype = model.get('ptype');
    switch (ptype) {
      case 'drug': return DrugPrescriptionView;
      case 'care': return CarePrescriptionView;
      default: throw 'There\'s no way to render an item of type ' + ptype;
    }
  }
});

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
  },
  focusSearchField: function() {
    $(this.ui.searchField).focus();
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

    if (q.length >= 3) {
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
  },
  focusSearchField: function() {
    $(this.ui.searchField).focus();
  }
});

/*******************************************************************************
 * Marionette application
 ******************************************************************************/
var Raphael = Marionette.Application.extend({

  initialize: function(options) {

    var self = this;

    this.session = new Session({
      current: new NoPrescription({
        patient: new Patient({
          firstName: 'Orango',
          lastName: 'Tango'
        })
      })
    });

    this.prescriptions = new Prescriptions();

    this.prescriptionsView = new PrescriptionsView({
      collection: this.prescriptions
    });

    this.prescriptionsView.on('childview:removeprescription', self.onRemovePrescription.bind(self));
  },

  onStart: function(options) {
    var self = this;

    setUpTheme(document);

    // Register handlers from self.events
    _.each(self.events, function(v, k){
      self.on(k, self[v].bind(self));
    });

    this.prescriptionsView.setElement($('#PrescriptionsContainer'));
    this.prescriptionsView.render();
  },

  events: {
    'createdrug': 'onCreateDrugPrescription',
    'createcare': 'onCreateCarePrescription',
    'clear': 'onClear'
  },

  onRemovePrescription: function(childView) {
    this.prescriptions.remove(childView.model);
  },

  onCreateDrugPrescription: function() {
    var p = new DrugPrescription({
      patient: this.session.get('current').get('patient'),
      counter: this.prescriptions.size() + 1
    });

    this.prescriptions.add(p);
    this.session.set('current', p);
    this.scrollToLastDocument();
  },

  onCreateCarePrescription: function() {
    var p = new CarePrescription({
      patient: this.session.get('current').get('patient'),
      counter: this.prescriptions.size() + 1
    });

    this.prescriptions.add(p);
    this.session.set('current', p);
    this.scrollToLastDocument();
  },

  onClear: function() {
    var current = this.session.get('current');

    this.prescriptions.reset();
    this.session.set('current', new NoPrescription({
      patient: current.get('patient')
    }));
  },

  scrollToLastDocument: function() {
    $(document).scrollTo(this.prescriptionsView.children.last().$el, 'fast', {offset: -85});
  }

});


/*******************************************************************************
 * Misc functions
 ******************************************************************************/
function setUpTheme(ctx) {
  $('[data-toggle="checkbox"]', ctx).radiocheck();
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
