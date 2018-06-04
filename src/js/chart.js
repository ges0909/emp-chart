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

  prefly: function(groupedByX, mode) {
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
      var slots = Object.keys(groupedByX).length /*number of slots*/;
      slotwidth = (maxx - minx) / (slots - 1);
    }
    return slotwidth / maxbars * 0.9;
  },

  center: function(dataset, mode, granularity) {
    var minX, maxX, maxY;
    var groupedByX = _.groupBy(this.flatMap(dataset), function(point) {
      return point[0]; // x-coordinate
    });
    var barWidth = this.prefly(groupedByX, mode);
    for (var x in groupedByX) {
      var pointsOnX = groupedByX[x];
      var leftshift = barWidth * (pointsOnX.length / 2);
      pointsOnX.forEach(function(point, index) {
        point[0] -= leftshift - index * barWidth;
        minX = minX ? Math.min(minX, point[0]) : point[0];
        maxX = maxX ? Math.max(maxX, point[0] + barWidth) : point[0] + barWidth;
        maxY = maxY ? Math.max(maxY, point[1]) : point[1];
      });
    }
    // if (granularity === 'monthly') {
    //   minX = moment(minX).startOf('month');
    //   maxX = moment(maxX).endOf('month');
    // } else if (granularity === 'yearly') {
    //   minX = moment(minX).startOf('year');
    //   maxX = moment(maxX).endOf('year');
    // }
    return [ minX, maxX, maxY, barWidth ];
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
        tickFormatter: function(value) {
          return _.round(value, 2).toFixed(2) + ' ' + unit;
        }
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

    var dataset = [];
    for (var location in values) {
      var series = values[location];
      if (series.length > 0) {
        dataset.push({
          label: location, // label must be given to list series in legend
          data: series
        });
      }
    }

    // xaxis
    if (dataDefinition === 'average' || dataDefinition === 'accumulateAndAverage' || dataDefinition === 'comparison') {
      if (granularity === 'daily') {
        options.xaxis.ticks = _.times(365, function(index) {
          var m = moment().dayOfYear(index + 1);
          return [ index + 1, m.format('D' + '.' + m.format('M') + '.') ];
        });
      } else if (granularity === 'monthly') {
        var monthNames = moment.localeData(locale).monthsShort();
        options.xaxis.ticks = monthNames.map(function(month, index) {
          return [ index + 1, month ];
        });
        if (diagramType === 'barChart') {
          options.bars.barWidth = 0.2;
        }
      } else if (granularity === 'yearly') {
        options.xaxis.ticks = _.times(99, function(index) {
          return [ index + 1970, index + 1970 + '' ];
        });
      }
    } else {
      // 'time' mode
      options.xaxis.mode = 'time';
      options.xaxis.monthNames = moment.localeData(locale).monthsShort();
      if (granularity === 'daily') {
        options.xaxis.minTickSize = [ 1, 'day' ];
        options.xaxis.timeformat = '%b %d';
      } else if (granularity === 'monthly') {
        // options.xaxis.minTickSize = [ 1, 'month' ];
        options.xaxis.maxTickSize = [ 1, 'month' ];
        options.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        // options.xaxis.minTickSize = [ 1, 'year' ];
        options.xaxis.maxTickSize = [ 1, 'year' ];
        options.xaxis.timeformat = '%Y';
      }
    }

    if (diagramType === 'barChart') {
      [ options.xaxis.min, options.xaxis.max, options.yaxis.max, options.bars.barWidth ] = this.center(
        dataset,
        options.xaxis.mode,
        granularity
      );
    }

    options.lines.show = diagramType === 'lineChart';
    options.bars.show = diagramType === 'barChart';

    this.plot_ = $.plot(divId, dataset, options);
  }
};
