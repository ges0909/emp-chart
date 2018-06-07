'use strict';

var Chart = {
  plot_: null,

  flatMap: function(dataset) {
    var points = dataset.map(function(ds) {
      return ds.data;
    });
    if (points.length > 0) {
      return points.reduce(function(acc, point) {
        return acc.concat(point, []);
      });
    }
    return [];
  },

  minmax: function(dataset) {
    var minx, maxx, maxy;
    dataset.forEach(function(ds) {
      var points = ds.data;
      points.forEach(function(point) {
        minx = minx ? Math.min(minx, point[0]) : point[0];
        maxx = maxx ? Math.max(maxx, point[0]) : point[0];
        maxy = maxy ? Math.max(maxy, point[1]) : point[1];
      });
    });
    return [ minx, maxx, maxy ];
  },

  maxBarNumber: function(dataset) {
    var maxBarNumber = 0;
    var filteredByBars = dataset.filter(function(ds) {
      return ds.bars.show;
    });
    var groupedByX = _.groupBy(this.flatMap(filteredByBars), function(point) {
      return point[0];
    });
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      pointsOnX.forEach(function(point, index) {
        maxBarNumber = Math.max(maxBarNumber, index + 1);
      });
    }
    return maxBarNumber;
  },

  slotWidth: function(dataset, granularity, start, end) {
    var from = moment(start);
    var to = moment(end);
    var slots = to.diff(from, 'day') + 1; // number of time slots between first and last data point
    if (granularity === 'monthly') {
      slots = to.diff(from, 'month') + 1;
    } else if (granularity === 'yearly') {
      slots = to.diff(from, 'year') + 1;
    }
    var slotwidth = (end - start) / slots;
    if (slots === 1) {
      slotwidth = moment.duration(1, 'days').asMilliseconds();
      if (granularity === 'monthly') {
        slotwidth = moment.duration(1, 'months').asMilliseconds();
      } else if (granularity === 'yearly') {
        slotwidth = moment.duration(1, 'years').asMilliseconds();
      }
    }
    return slotwidth;
  },

  shift: function(dataset, barwidth) {
    var minx, maxx, maxy;
    var filteredByBars = dataset.filter(function(ds) {
      return ds.bars.show;
    });
    var groupedByX = _.groupBy(this.flatMap(filteredByBars), function(point) {
      return point[0]; // x-coordinate
    });
    for (var x in groupedByX) {
      for (var x in groupedByX) {
        var pointsOnX = groupedByX[x];
        var leftshift = barwidth * pointsOnX.length / 2;
        pointsOnX.forEach(function(point, index) {
          point[0] -= leftshift - index * barwidth;
          minx = minx ? Math.min(minx, point[0]) : point[0];
          maxx = maxx ? Math.max(maxx, point[0] + barwidth) : point[0] + barwidth;
        });
      }
      return [ minx, maxx ];
    }
  },

  show: function(divId, json, locale) {
    var { dataDefinition, granularity, start, end } = json;

    var options = {
      xaxis: {},
      yaxis: {
        min: 0,
        tickFormatter: function(value) {
          return _.round(value, 2).toFixed(2) + ' ' + json.unit;
        }
      },
      bars: {},
      lines: {},
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

    var dataset = [];
    for (var label in json.series) {
      var { data, type } = json.series[label];
      if (data.length > 0) {
        dataset.push({
          label: label, // label must be given to list series in legend
          data: data,
          bars: { show: type === 'bar' },
          lines: { show: type === 'line' }
        });
      }
    }

    [ options.xaxis.min, options.xaxis.max, options.yaxis.max ] = this.minmax(dataset);

    var useTicks =
      dataDefinition === 'average' || dataDefinition === 'accumulateAndAverage' || dataDefinition === 'comparison';

    // xaxis
    if (useTicks) {
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
      } else if (granularity === 'yearly') {
        options.xaxis.ticks = _.times(99, function(index) {
          return [ index + 1970, index + 1970 + '' ];
        });
      }
    } else {
      // 'time' mode
      options.xaxis.mode = 'time';
      options.xaxis.min = start;
      options.xaxis.max = end;
      options.xaxis.monthNames = moment.localeData(locale).monthsShort();
      if (granularity === 'daily') {
        options.xaxis.minTickSize = [ 1, 'day' ];
        options.xaxis.timeformat = '%b %d';
      } else if (granularity === 'monthly') {
        options.xaxis.minTickSize = [ 1, 'month' ];
        options.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        options.xaxis.minTickSize = [ 1, 'year' ];
        options.xaxis.timeformat = '%Y';
      }
    }

    var maxBarNumber = this.maxBarNumber(dataset);

    if (maxBarNumber > 0) {
      if (useTicks) {
        options.bars.barWidth = 1 / maxBarNumber * 0.9;
      } else {
        var slotwidth = this.slotWidth(dataset, granularity, start, end);
        options.bars.barWidth = slotwidth / maxBarNumber * 0.9;
      }
      var [ minX, maxX ] = this.shift(dataset, options.bars.barWidth);
      options.xaxis.min = Math.min(options.xaxis.min, minX);
      options.xaxis.max = Math.max(options.xaxis.max, maxX);
    }

    this.plot_ = $.plot(divId, dataset, options);
  }
};
