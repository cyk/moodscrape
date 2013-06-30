/**
 * Moodscrape - Data liberation for YOUR Moodscope scores.
 * ==========
 * Run this script from https://www.moodscope.com/chart
 * when logged in to generate an csv export of all your
 * Moodscope scores. Only tested in Chrome.
 */

(function($) {

  var chartUrl = 'https://www.moodscope.com/chart',
      $dateSelectOptions = $('select[name=month] option'),
      months = [],
      scores = [];

  // Alert user if current url isn't expected.
  window.location.origin + window.location.pathname === chartUrl
  || alert('This may not work! Expecting URL to be: \n' + chartUrl);

  // Extract months that have scores.
  $dateSelectOptions.each(function() {

    // Keep values with YYYY-MM format.
    if (/^[0-9]{4}-[0-9]{2}$/i.test(this.value)) {
      months.push(this.value);
    }
  });

  // Fetch scores with months using GETs.
  var fetchingScores = $.map(months, function(month) {
    return $.get(chartUrl + '?month=' + month, function(data) {

      // Eval relevant chart script to access it's vars.
      $.globalEval($(data).filter('script:contains("chart =")')[0].text);

      // Save month and chart data to scores.
      scores = scores.concat(chart.series[0].data);
    });
  });

  // When all scores have been fetched...
  $.when.apply(null, fetchingScores).done(function() {
    var output = 'data:text/csv;charset=utf-8,',
        link = document.createElement('a');

    // iterate over scores
    $.each(scores, function() {
      var date = this.url.replace('/chart/annotate/', ''),
          explanation = this.name
            .replace(/"/g, '\"')
            .replace(/<br\/>/g, ' ');

      // empty default explanation
      if (explanation === 'Click to add explanation') {
        explanation = '';
      }

      // add row.
      output = output + [
        date,
        this.y, // score
        '"' + explanation + '"'
      ].join(',') + '\n';
    });

    // Fake a link to trigger download of csv export.
    link.setAttribute("href", encodeURI(output));
    link.setAttribute("download", "moodscope_export.csv");

    // Dispatch our own click event to fix .click() issue on FF and mobile browsers. 
    (function(){
      var simClick = function(node) {
          var event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          node.dispatchEvent(event);
      }
      simClick(link);
    }());
    
  });

}(jQuery));