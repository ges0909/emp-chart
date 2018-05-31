'use strict';

var Chart = {
  plot_: null,

  options_: {
    lines: {
      show: false
    },
    bars: {
      show: false,
      lineWidth: 0
    },
    xaxis: {},
    yaxis: {
      min: 0,
      tickFormatter: null
    },
    legend: {
      show: true
    },
    grid: {
      borderWidth: 0,
      backgroundColor: '#fafafa',
      hoverable: true,
      clickable: true
    }
  },

  center: function(dataset, numberOfBarsToShow, barWidth) {
    var leftshift = barWidth * (numberOfBarsToShow / 2);
    dataset.forEach(function(ds, index) {
      ds.data.forEach(function(xy) {
        xy[0] -= leftshift - index * barWidth;
      });
    });
  },

  maxOfX: function(series) {
    var max = series.reduce(function(accu, xy) {
      return xy[0] > accu[0] ? xy : accu;
    });
    return max[0];
  },

  maxOfY: function(series) {
    var max = series.reduce(function(accu, xy) {
      return xy[1] > accu[1] ? xy : accu;
    });
    return max[1];
  },

  show: function(divId, values, unit, diagramType, granularity, dataDefinition, startDate, endDate, locale) {
    var xmax = 0;
    var ymax = 0;
    var dataset = [];
    for (var group in values) {
      var series = values[group];
      xmax = Math.max(xmax, this.maxOfX(series));
      ymax = Math.max(ymax, this.maxOfY(series));
      if (series.length > 0) {
        var data = {
          label: group, // label must be given to list series in legend
          data: series
        };
        dataset.push(data);
      }
    }

    // xaxis
    var monthNames = moment.localeData(locale).monthsShort();
    if (dataDefinition === 'average') {
      this.options_.xaxis.min = 0;
      this.options_.xaxis.max = xmax + 1;
      this.options_.bars.barWidth = 1;
      if (granularity === 'monthly') {
        this.options_.xaxis.ticks = monthNames.map(function(month, index) {
          return [ index, month ];
        });
      }
    } else {
      // mode: time
      this.options_.xaxis.mode = 'time';
      this.options_.xaxis.monthNames = monthNames;
      var startTs = moment(startDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var endTs = moment(endDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var period = endTs - startTs;
      this.options_.xaxis.min = startTs - period / 100 * 2; // add 2 percent on left side as margin
      this.options_.xaxis.max = endTs + period / 100 * 10; // add 10 percent on right side as margin
      this.options_.bars.barWidth = period / 100 * 2;
      if (granularity === 'daily') {
        this.options_.xaxis.minTickSize = [ 1, 'day' ];
        this.options_.xaxis.timeformat = '%b %d';
      } else if (granularity === 'monthly') {
        this.options_.xaxis.minTickSize = [ 1, 'month' ];
        this.options_.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        this.options_.xaxis.minTickSize = [ 1, 'year' ];
        this.options_.xaxis.timeformat = '%y';
      }
    }

    // yaxis
    if (dataset.length === 0) {
      this.options_.yaxis.tickFormatter = function() {
        return '';
      };
    } else {
      ymax = ymax + ymax / 100 * 5; // add 5 percent as upper margin
      this.options_.yaxis.max = ymax;
      this.options_.yaxis.tickFormatter = function(value) {
        return _.round(value, 2).toFixed(2) + ' ' + unit;
      };
    }

    this.options_.lines.show = diagramType === 'lineChart';
    this.options_.bars.show = diagramType === 'barChart';

    if (diagramType === 'barChart') {
      this.center(dataset, dataset.length, this.options_.bars.barWidth);
    }

    this.plot_ = $.plot(divId, dataset.length === 0 ? [ [] ] /*show grid without chart*/ : dataset, this.options_);
  }
};
