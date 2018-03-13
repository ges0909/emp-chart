'use strict';

var Chart = {
  plot_: null,
  DATETIME_FORMAT : 'DD/MM/YYYY hh:mm:ss',

  options_: {
    lines: {
      show: false
    },
    bars: {
      show: false,
      barWidth: 60 * 30 * 1000, // 1h
      lineWidth: 0,
      fillColor: {
        colors: [
          {
            opacity: 1
          },
          {
            opacity: 0.7
          }
        ]
      }
    },
    xaxis: {
      mode: 'time',
      minTickSize: [ 1, 'month' ],
      timeformat: '%b',
      monthNames: [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
      min: 0,
      max: 0
    },
    yaxis: {
      min: 0,
      max: 0,
      tickFormatter: null
    },
    legend: {
      show: true
    },
    grid: {
      borderWidth: 0
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

  /**
   * Prepares the JSON 'values' as returned by the backend as data series to be 
   * consumed by flot. Each series will be displayed as single chart (with respect
   * to the example below 3 charts would be shown). Each data value of a series
   * consists of time value as number of mircoseconds siche 01.01.1970 and the
   * the related metering value resp. consumption. 
   * 
   * Backend result example:
   * {
   *   "unit": "kWh",
   *   "values": {
   *      "Berlin Nord": [[1520380800000, 111.69], [1520553600000, 204.41], [1520467200000, 216]],
   *      "Berlin Ost":  [[1520380800000, 46.87], [1520553600000, 90.91], [1520467200000, 90.37]],
   *      "München Süd": [[1520380800000, 31.2], [1520553600000, 48.13], [1520467200000, 56.6]]
   *     }
   * }
   */
  preview: function(divId, json, diagramType, granularity, startDate, endDate) {
    var ymax = 0;
    var dataset = [];
    var unit = json['unit'];
    var values = json['values'];
    for (var group in values) {
      var series = values[group];
      var maxElem = series.reduce(function(accu, yx) {
        return yx[1] > accu[1] ? yx : accu;
      });
      ymax = maxElem[1] > ymax ? maxElem[1] : ymax;
      if (series.length > 0) {
        var data = {
          label: group, // label must be given to list series in legend
          data: series
        };
        dataset.push(data);
      }
    }

    this.options_.lines.show = diagramType === 'lineChart';
    this.options_.bars.show = diagramType === 'barChart';

    this.options_.yaxis.max = dataset.length === 0 ? 1 : ymax;
    this.options_.yaxis.tickFormatter = function(value) {
      return _.round(value, 2).toFixed(2) + ' ' + unit;
    };

    // add left and right timed based margin
    var minMoment = moment(startDate + ' 00:00:00', this.DATETIME_FORMAT);
    var maxMoment = moment(endDate + ' 00:00:00', this.DATETIME_FORMAT);
    this.options_.xaxis.min = minMoment.subtract(4, 'hours').valueOf();
    this.options_.xaxis.max = maxMoment.add(12, 'hours').valueOf();

    if (diagramType === 'barChart') {
      this.center(dataset, dataset.length, this.options_.bars.barWidth);
    }

    if (granularity === 'daily') {
      this.options_.xaxis.minTickSize = [ 1, 'day' ];
      this.options_.xaxis.timeformat = '%d.%m.';
    } else if (granularity === 'monthly') {
      this.options_.xaxis.minTickSize = [ 1, 'month' ];
      this.options_.xaxis.timeformat = '%b';
    } else if (granularity === 'yearly') {
      this.options_.xaxis.minTickSize = [ 1, 'year' ];
      this.options_.xaxis.timeformat = '%y';
    }

    this.plot_ = $.plot(divId, dataset.length === 0 ? [ [] ] /*show grid without chart*/ : dataset, this.options_);
  }
};
