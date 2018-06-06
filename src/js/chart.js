'use strict';

var Chart = {
  plot_: null,

  flatMap: function(dataset) {
    return dataset
      .map(function(ds) {
        return ds.data;
      })
      .reduce(function(acc, point) {
        return acc.concat(point, []);
      });
  },

  prefly: function(groupedByX, mode, granularity) {
    var minx, maxx, maxbars;
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      pointsOnX.forEach(function(point, index) {
        minx = minx ? Math.min(minx, point[0]) : point[0];
        maxx = maxx ? Math.max(maxx, point[0]) : point[0];
        maxbars = maxbars ? Math.max(maxbars, index + 1) : index + 1;
      });
    }
    var slotwidth = 1;
    if (mode && mode === 'time') {
      var from = moment(minx);
      var to = moment(maxx);
      var slots = to.diff(from, 'day') + 1; // number of time slots between first and last data point
      if (granularity === 'monthly') {
        slots = to.diff(from, 'month') + 1;
      } else if (granularity === 'yearly') {
        slots = to.diff(from, 'year') + 1;
      }
      if (slots === 1) {
        slotwidth = moment.duration(1, 'days').asMilliseconds();
        if (granularity === 'monthly') {
          slotwidth = moment.duration(1, 'months').asMilliseconds();
        } else if (granularity === 'yearly') {
          slotwidth = moment.duration(1, 'years').asMilliseconds();
        }
      } else {
        slotwidth = (maxx - minx) / slots;
      }
    }
    return slotwidth / maxbars * 0.9;
  },

  center: function(dataset, mode, granularity) {
    var minX, maxX, maxY;
    var groupedByX = _.groupBy(this.flatMap(dataset), function(point) {
      return point[0]; // x-coordinate
    });
    var barWidth = this.prefly(groupedByX, mode, granularity);
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      var leftshift = barWidth * pointsOnX.length / 2;
      pointsOnX.forEach(function(point, index) {
        point[0] -= leftshift - index * barWidth;
        minX = minX ? Math.min(minX, point[0]) : point[0];
        maxX = maxX ? Math.max(maxX, point[0] + barWidth) : point[0] + barWidth;
        maxY = maxY ? Math.max(maxY, point[1]) : point[1];
      });
    }
    return [ minX, maxX, maxY, barWidth ];
  },

  show: function(divId, json, locale) {
    var options = {
      xaxis: {},
      yaxis: {
        min: 0,
        tickFormatter: function(value) {
          return _.round(value, 2).toFixed(2) + ' ' + json.unit;
        }
      },
      bars: {
        // lineWidth: 0
      },
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

    // xaxis
    if (
      json.dataDefinition === 'average' ||
      json.dataDefinition === 'accumulateAndAverage' ||
      json.dataDefinition === 'comparison'
    ) {
      if (json.granularity === 'daily') {
        options.xaxis.ticks = _.times(365, function(index) {
          var m = moment().dayOfYear(index + 1);
          return [ index + 1, m.format('D' + '.' + m.format('M') + '.') ];
        });
      } else if (json.granularity === 'monthly') {
        var monthNames = moment.localeData(locale).monthsShort();
        options.xaxis.ticks = monthNames.map(function(month, index) {
          return [ index + 1, month ];
        });
        if (json.diagramType === 'barChart') {
          options.bars.barWidth = 0.2;
        }
      } else if (json.granularity === 'yearly') {
        options.xaxis.ticks = _.times(99, function(index) {
          return [ index + 1970, index + 1970 + '' ];
        });
      }
    } else {
      // 'time' mode
      options.xaxis.mode = 'time';
      options.xaxis.monthNames = moment.localeData(locale).monthsShort();
      if (json.granularity === 'daily') {
        options.xaxis.minTickSize = [ 1, 'day' ];
        options.xaxis.timeformat = '%b %d';
      } else if (json.granularity === 'monthly') {
        options.xaxis.minTickSize = [ 1, 'month' ];
        options.xaxis.timeformat = '%b';
      } else if (json.granularity === 'yearly') {
        options.xaxis.minTickSize = [ 1, 'year' ];
        options.xaxis.timeformat = '%Y';
      }
    }

    [ options.xaxis.min, options.xaxis.max, options.yaxis.max, options.bars.barWidth ] = this.center(
      dataset,
      options.xaxis.mode,
      json.granularity
    );

    this.plot_ = $.plot(divId, dataset, options);
  }
};
