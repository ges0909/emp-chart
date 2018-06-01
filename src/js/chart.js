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

  center: function(dataset, barWidth, min, max) {
    var flattenpointsAtX = _.flatMap(dataset, function(ds) {
      return ds.data;
    });
    var groupedByX = _.groupBy(flattenpointsAtX, function(point) {
      return point[0]; // x-coordinate
    });
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      var leftshift = barWidth * (pointsOnX.length / 2);
      pointsOnX.forEach(function(point, index) {
        point[0] -= leftshift - index * barWidth;
        min = Math.min(min, point[0]);
        max = Math.max(max, point[0] + barWidth);
      });
    }
    return {
      min: min,
      max: max
    };
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
    for (var location in values) {
      var series = values[location];
      xmax = Math.max(xmax, this.maxOfX(series));
      ymax = Math.max(ymax, this.maxOfY(series));
      if (series.length > 0) {
        dataset.push({
          label: location, // label must be given to list series in legend
          data: series
        });
      }
    }

    // xaxis
    if (dataDefinition === 'average' || dataDefinition === 'accumulateAndAverage' || dataDefinition === 'comparison') {
      this.options_.bars.barWidth = 1;
      if (granularity === 'daily') {
        this.options_.xaxis.min = 1;
        this.options_.xaxis.max = 366;
        this.options_.xaxis.ticks = _.times(365, function(index) {
          var m = moment().dayOfYear(index + 1);
          return [ index + 1, m.format('D' + '.' + m.format('M') + '.') ];
        });
      } else if (granularity === 'monthly') {
        this.options_.xaxis.min = 1;
        this.options_.xaxis.max = 12;
        var monthNames = moment.localeData(locale).monthsShort();
        this.options_.xaxis.ticks = monthNames.map(function(month, index) {
          return [ index + 1, month ];
        });
        if (diagramType === 'barChart') {
          this.options_.bars.barWidth = 0.2;
        }
      } else if (granularity === 'yearly') {
        this.options_.xaxis.ticks = _.times(99, function(index) {
          return [ index + 1970, index + 1970 + '' ];
        });
      }
    } else {
      // mode: time
      this.options_.xaxis.mode = 'time';
      var startTs = moment(startDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var endTs = moment(endDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var period = endTs - startTs;
      this.options_.xaxis.min = startTs - period / 100 * 2; // add 2 percent on left side as margin
      this.options_.xaxis.max = endTs + period / 100 * 10; // add 10 percent on right side as margin
      this.options_.bars.barWidth = period / 100 * 2;
      this.options_.xaxis.monthNames = moment.localeData(locale).monthsShort();
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
      var minmax = this.center(dataset, this.options_.bars.barWidth, this.options_.xaxis.min, this.options_.xaxis.max);
      this.options_.xaxis.min = Math.min(this.options_.xaxis.min, minmax.min);
      this.options_.xaxis.max = Math.max(this.options_.xaxis.max, minmax.max);
    }

    this.plot_ = $.plot(divId, dataset.length === 0 ? [ [] ] /*show grid without chart*/ : dataset, this.options_);
  }
};
