//method taken from http://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function percentageForDisplay(total_tests, passed_tests){
	if (total_tests === 0){
		return 0;
	}
	return round(passed_tests * 100 / total_tests,2);
}

module.exports = percentageForDisplay;
