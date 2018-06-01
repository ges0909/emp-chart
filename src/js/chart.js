'use strict';

var Chart = {
  plot_: null,

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

  flatMap: function(dataset) {
    return dataset
      .map(function(ds) {
        return ds.data;
      })
      .reduce(function(acc, point) {
        return acc.concat(point, []);
      });
  },

  center: function(dataset, barWidth, minX, maxX) {
    var groupedByX = _.groupBy(this.flatMap(dataset), function(point) {
      return point[0]; // x-coordinate
    });
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      var leftshift = barWidth * (pointsOnX.length / 2);
      pointsOnX.forEach(function(point, index) {
        point[0] -= leftshift - index * barWidth;
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0] + barWidth);
      });
    }
    return {
      min: minX,
      max: maxX
    };
  },

  show: function(divId, values, unit, diagramType, granularity, dataDefinition, startDate, endDate, locale) {
    var options = {
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
    };

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
      options.bars.barWidth = 1;
      if (granularity === 'daily') {
        options.xaxis.min = 1;
        options.xaxis.max = 366;
        options.xaxis.ticks = _.times(365, function(index) {
          var m = moment().dayOfYear(index + 1);
          return [ index + 1, m.format('D' + '.' + m.format('M') + '.') ];
        });
      } else if (granularity === 'monthly') {
        options.xaxis.min = 1;
        options.xaxis.max = 12;
        var monthNames = moment.localeData(locale).monthsShort();
        options.xaxis.ticks = monthNames.map(function(month, index) {
          return [ index + 1, month ];
        });
        if (diagramType === 'barChart') {
          options.bars.barWidth = 0.2;
        }
      } else if (granularity === 'yearly') {
        options.xaxis.min = 2015;
        options.xaxis.max = 2020;
        //        options.bars.barWidth = 2;
        options.xaxis.ticks = _.times(99, function(index) {
          return [ index + 1970, index + 1970 + '' ];
        });
      }
    } else {
      // mode: time
      options.xaxis.mode = 'time';
      var startTs = moment(startDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var endTs = moment(endDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
      var period = endTs - startTs;
      options.xaxis.min = startTs - period / 100 * 2; // add 2 percent on left side as margin
      options.xaxis.max = endTs + period / 100 * 10; // add 10 percent on right side as margin
      options.bars.barWidth = period / 100 * 2;
      options.xaxis.monthNames = moment.localeData(locale).monthsShort();
      options.xaxis.ticks = null;
      if (granularity === 'daily') {
        options.xaxis.minTickSize = [ 1, 'day' ];
        options.xaxis.timeformat = '%b %d';
      } else if (granularity === 'monthly') {
        options.xaxis.minTickSize = [ 1, 'month' ];
        options.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        options.xaxis.minTickSize = [ 1, 'year' ];
        options.xaxis.timeformat = '%y';
      }
    }

    // yaxis
    if (dataset.length === 0) {
      options.yaxis.tickFormatter = function() {
        return '';
      };
    } else {
      ymax = ymax + ymax / 100 * 5; // add 5 percent as upper margin
      options.yaxis.max = ymax;
      options.yaxis.tickFormatter = function(value) {
        return _.round(value, 2).toFixed(2) + ' ' + unit;
      };
    }

    options.lines.show = diagramType === 'lineChart';
    options.bars.show = diagramType === 'barChart';

    if (diagramType === 'barChart') {
      var minmax = this.center(dataset, options.bars.barWidth, options.xaxis.min, options.xaxis.max);
      options.xaxis.min = Math.min(options.xaxis.min, minmax.min);
      options.xaxis.max = Math.max(options.xaxis.max, minmax.max);
    }

    this.plot_ = $.plot(divId, dataset.length === 0 ? [ [] ] /*show grid without chart*/ : dataset, options);
  }
};
