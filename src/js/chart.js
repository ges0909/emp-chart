'use strict';

var Chart = {
  plot_: null,

  options_: {
    lines: {
      show: false
    },
    bars: {
      show: false,
      barWidth: 0,
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

  adjust: function(timeframe, granularity, startdate, enddate) {
    if (timeframe === 'currentYear' || timeframe === 'lastYear' || timeframe === 'last12Months') {
      if (granularity === 'monthly') {
        //     this.options_.xaxis.min = moment(startdate).subtract(1, 'month').valueOf();
        this.options_.xaxis.tickSize = [ 1, 'month' ];
        this.options_.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        this.options_.xaxis.tickSize = [ 1, 'year' ];
        this.options_.xaxis.timeformat = '%b';
      }
    } else if (timeframe === 'lastYear') {
      if (granularity === 'monthly') {
        this.options_.xaxis.tickSize = [ 1, 'month' ];
        this.options_.xaxis.timeformat = '%b';
      } else if (granularity === 'yearly') {
        this.options_.xaxis.tickSize = [ 1, 'year' ];
        this.options_.xaxis.timeformat = '%b';
      }
    } else if (timeframe === 'last3Years') {
    } else if (timeframe === 'lastMonth') {
    } else if (timeframe === 'last15Days') {
    } else if (timeframe === 'currentAndLastYear') {
    } else if (timeframe === 'currentAndLast11Months') {
    } else if (timeframe === 'currentAndLast3Years') {
    } else if (timeframe === 'currentAndLastMonth') {
    }
  },

  /**
   * Prepares the JSON 'values' as returned by the backend as data series to be 
   * consumed by flot. Each series will be displayed as single chart (with respect
   * to the example below 3 charts would be shown). Each data value of a series
   * consists of time value as number of mircoseconds siche 01.01.1970 and the
   * the related metering value resp. consumption.
   */
  show: function(divId, values, unit, diagramType, granularity, startDate, endDate) {
    var ymax = 0;
    var dataset = [];
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

    if (dataset.length === 0) {
      this.options_.yaxis.tickFormatter = function() {
        return '';
      };
    } else {
      ymax = ymax + (ymax / 100) * 5; // add 5 percebt as upper margin
      this.options_.yaxis.max = ymax;
      this.options_.yaxis.tickFormatter = function(value) {
        return _.round(value, 2).toFixed(2) + ' ' + unit;
      };
    }

    // xaxis
    var startTs = moment(startDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
    var endTs = moment(endDate, 'DD/MM/YYYY HH:mm:ss').valueOf();
    var period = endTs - startTs;
    this.options_.xaxis.min = startTs - period / 100 * 2; // add 2 percent on left side as margin
    this.options_.xaxis.max = endTs + period / 100 * 10; // add 10 percent on right side as margin

    this.options_.bars.barWidth = period / 100 * 2;

    if (diagramType === 'barChart') {
      this.center(dataset, dataset.length, this.options_.bars.barWidth);
    }

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

    this.plot_ = $.plot(divId, dataset.length === 0 ? [ [] ] /*show grid without chart*/ : dataset, this.options_);
  }
};
