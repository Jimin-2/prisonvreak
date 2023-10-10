/* Documentation sample */

function loadPage(page) {

	var img = $('<img />');
	img.load(function() {
		var container = $('.sample-docs .p'+page);
		img.css({width: container.width(), height: container.height()});
		img.appendTo($('.sample-docs .p'+page));
		container.find('.loader').remove();
	});

	img.attr('src', '/img/manual/' +  page + '.JPG');

}

function addPage(page, book) {

	var id, pages = book.turn('pages');

	var element = $('<div />', {});

	if (book.turn('addPage', element, page)) {
		if (page<28) {
			element.html('<div class="gradient"></div><div class="loader"></div>');
			loadPage(page);
		}
	}
}

function updateTabs() {
	var tabs = {1: '표지', 2: '전선연결', 3: '모스 부호', 4: '슬라이드스위치', 5: '금고열기', 6:'미로찾기',7:'살인범 찾기'},
		book = $('.sample-docs'),
		actualPage = book.turn('page'),
		view = book.turn('view');

	// 탭을 생성할 HTML 문자열
	var tabHtml = '';

	for (var page in tabs) {
		var isHere = $.inArray(parseInt(page, 10), view) !== -1;
		var tabClass = isHere ? 'on' : '';

		tabHtml += '<a href="#page/' + page + '" class="' + tabClass + '">' + tabs[page] + '</a>';
	}

	// .left 요소 내부에 탭 추가
	$('.tabs .tab').html(tabHtml);
}