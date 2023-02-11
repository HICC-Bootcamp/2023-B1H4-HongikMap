

//선그리기
let pathResult = [];
//canvas 엘리먼트를 취득한다.
const canvas = document.getElementById('myCanvas');
// 2d모드의 그리기 객체를 취득한다. => 이 객체를 통해 canvas에 그림을 그릴 수 있다.
const ctx = canvas.getContext("2d");
//색깔
ctx.strokeStyle = '#FF5A5A';
//굵기
ctx.lineWidth = 6;
//꺽인부분처리
 ctx.lineCap = 'round';
//선긋는 함수 pathResult에 경로좌표리스트
function drawLine(pathResult){
    //선 초기화
    ctx.clearRect(0, 0, 1300, 700);
    //새 선 그리기
    ctx.beginPath();

    for(var i=0; i<pathResult.length-1; i++){
        if(pathResult[i].length==0 || pathResult[i+1].length==0 ){
            continue;
        }
        //시작점 지정
        ctx.moveTo(pathResult[i][0], pathResult[i][1]);
        //도착점 지정
        ctx.lineTo(pathResult[i+1][0], pathResult[i+1][1]);
        //실선 그리기
        ctx.stroke();

    }
}


//클릭하면 콘솔에 좌표 출력
canvas.onclick = function(event){

    const x = event.clientX - ctx.canvas.offsetLeft;

    const y = event.clientY - ctx.canvas.offsetTop;
    console.log(x, y);
}

let number=0;
let amenitiesName='cafe';





//##입력데이터 백으로 보내기 및 처리된 데이터 받기
// csrf token
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

//변수 선언
let receivedList =[];

//데이터 보내기, setautocomplete함수밑에서 보내는 동작 구현
function sendingData(inp){ //inp는 input객체
    if(inp == document.getElementById('autoInput')){
        boolDepartureCheck = false;
    } else{
        boolDestinationCheck = false;
    }
    $.ajax({
        url: 'recommend',
        type: 'POST',
        data: {'input_val':inp.value.toUpperCase(), //대문자 변환해서 소문자도 검색가능
        'csrfmiddlewaretoken':csrftoken,
        },
        datatype: 'json',
        success: function(data){
            receivedList = data['recommendations'];
            autocomplete.setAutocomplete(inp, receivedList); //autocomplete함수를 input객체를 받아 실행
            console.log(receivedList);
        }
    });
}

//##자동완성
// autocomplete 부분을 생성
let autocomplete = (function () {

    let _inp = null;

    let _arr = [];

    let _currentFocus;

    let _setAutocomplete = function (inp, arr) {
        // autocomplete할 배열
        _arr = arr;


        // 기존의 input 값과 같지 않다면, 리스너 해제
        if (_inp === inp) {
            return;
        }

        // 기존 리스너해제
        _removeListener();

        // 새로운 input 의 리스너 추가.
        _inp = inp;
        _inp.addEventListener("keyup", inputEvent);
        _inp.addEventListener("keydown", keydownEvent);

    }

    let inputEvent = function (e) {
        //화살표 및 엔터면 출력된 자동완성 초기화 안한다
        if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13) {
            return false;
        }
        var a, b, i, val = this.value;//a,b,i는 지정되지않고 val만 입력값으로 저장
        // 이전 생성된 div 제거
        closeAllLists();

        // 요소 확인
        if (!val) {
            return false;
        }

        // 현재의 포커스의 위치는 없음.
        _currentFocus = -1;

        // autocomplet에서 항목을 보여줄 div 생성하고 이를 a에 준다.
        a = document.createElement("DIV");
        //
        a.setAttribute("id", this.id + "autocomplete-list");//속성주기
        // css 적용
        a.setAttribute("class", "autocomplete-items");

        // input 아래의 div 붙이기.
        this.parentNode.appendChild(a);

        // autocomplet할 요소 찾기
        for (i = 0; i < _arr.length; i++) {
            // 배열의 요소를 현재 input의 value의 값만큼 자른 후, 같으면 추가한다.

                b = document.createElement("DIV");
                // value의 값 만큼 굵게 표시
                b.innerHTML = "<strong>" + _arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += _arr[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + _arr[i] + "'>";

                // 생성된 div에서 이벤트 발생시 hidden으로 생성된 input안의 value의 값을 autocomplete할 요소에 넣기
                b.addEventListener("click", function (e) {
                    if(_inp == document.getElementById('autoInput')){
                        boolDepartureCheck = true;
                    } else{
                        boolDestinationCheck = true;
                    }
                    _inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });

                // autocomplete 리스트를 붙이기.
                a.appendChild(b);

        }
    }

    let keydownEvent = function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        // 선택할 요소 없으면 null ,
        if (x) {
            // 태그 네임을 가지는 엘리먼트의 유요한 html 컬렉션을 반환.
            // div의 값을 htmlCollection의 값으로 받아옴.
            x = x.getElementsByTagName("div");
        }

        if (e.keyCode == 40) {
            // down
            // 현재위치 증가
            _currentFocus++;
            // 현재위치의 포커스 나타내기
            addActive(x);
        } else if (e.keyCode == 38) {
            // up
            // 현재위치 감소
            _currentFocus--;
            // 현재위치의 포커스 나타내기
            addActive(x);
        } else if (e.keyCode == 13) {
            // enter
            if(this == document.getElementById('autoInput')){
                boolDepartureCheck = true;
            } else{
                boolDestinationCheck = true;
            }
            e.preventDefault();
            // 현재위치가 아이템 선택창내에 있는 경우
            if (_currentFocus > -1) {
                // 현재 위치의 값 클릭
                if (x) x[_currentFocus].click();
            }
        }
    }
    // //바깥 클릭하면 자동완성 사라짐
    // document.addEventListener("click", function (e) {
    //     closeAllLists(e.target);
    // });


    let addActive = function (x) {
        if (!x) return false;
        removeActive(x);
        if (_currentFocus >= x.length) _currentFocus = 0;
        if (_currentFocus < 0) _currentFocus = (x.length - 1);
        x[_currentFocus].classList.add("autocomplete-active");
    }


    let removeActive = function (x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }


    let closeAllLists = function (elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != _inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }


    let _removeListener = function () {
        if (_inp !== null) {
            console.log(_inp)
            _inp.removeEventListener("keyup", inputEvent, false);
            _inp.removeEventListener("keydown", keydownEvent, false);
        }
    }
    return {

        setAutocomplete: function (inp, arr) {
            _setAutocomplete(inp, arr);
        },
    }

})();






//##결과경로표시
//테스트케이스
var textList = {
    "elevatorUse":{'distance': 0, 'route': [], 'coordinates':[]},
    "elevatorNoUse":{'distance': 0, 'route': [], 'coordinates':[]}
};


function ElevPage(name){
    let show;
    let noShow;
    if(name=='use'){
        show = document.getElementById("elevatorUse");
        noShow = document.getElementById("elevatorNoUse");
    } else{
        show = document.getElementById("elevatorNoUse");
        noShow = document.getElementById("elevatorUse");
    }
    show.style.display="block";
    noShow.style.display="none";
    show.style.textAlign="center";

    show.replaceChildren();
    //최소 주기

    let timeText = document.createElement('div');
    timeText.setAttribute("id", "timeText");//속성주기
    timeText.innerHTML="최소";
    show.appendChild(timeText);

    //시간주기
    const seconds = parseInt(textList[show.getAttribute('id')]["distance"]);
    var min = parseInt((seconds%3600)/60);
    var sec = seconds%60;

    let newDivTime = document.createElement('div');
    newDivTime.setAttribute("id", "time");//속성주기
    if(min == 0){
        newDivTime.innerHTML=sec+"초";
    } else{
        newDivTime.innerHTML=min+"분 "+sec+"초";
    }
    show.appendChild(newDivTime);

    var j=1;

    for (var i=0; i<textList[show.getAttribute('id')]['route'].length;i++){
        let newDiv = document.createElement('div');
        newDiv.style.textAlign="center";
        newDiv.innerHTML=textList[show.getAttribute('id')]['route'][i];
        show.appendChild(newDiv);

        if(j<textList[show.getAttribute('id')]['route'].length)
        {
            let arrow_image=document.createElement('img');
            arrow_image.setAttribute('src', '../../static/logo/arrow.png');
            arrow_image.setAttribute('width', 30);
            arrow_image.setAttribute('height', 30);
            arrow_image.setAttribute("alt", "loading..");
            show.appendChild(arrow_image);
            j++;
        }

    }
    show.appendChild(document.createElement('br'));
    drawLine(textList[show.getAttribute('id')]["coordinates"]);
}



//##경로표시
let boolDepartureCheck = false;
let boolDestinationCheck = false;

//출발지, 도착지가 옳은 형식인지 체크
function getDirectionCheck(){
  if(boolDepartureCheck && boolDestinationCheck){
    return true;
  } else if(!boolDepartureCheck && boolDestinationCheck){
    alert('출발지를 입력하세요.');
    return false;
  } else if(boolDepartureCheck && !boolDestinationCheck){
    alert('도착지를 입력하세요.');
    return false;
  } else {
    alert('출발지, 도착지를 입력하세요.');
    return false;
  }
}

function submitCheck(event) {
    //submit될 때 페이지 리로드 방지
    //event.preventDefault();

    var departure = document.getElementById("autoInput").value;
    var destination = document.getElementById("autoInput1").value;
    departure = departure.toUpperCase();//소문자 대문자 변환
    destination = destination.toUpperCase();


    //출발지 도착지형식이 참이면 백으로 출발지 도착지 보내기
    if(getDirectionCheck()){
        //결과경로창 보이게끔
        document.getElementById("showRoute").style.visibility="visible";
        document.getElementById("elevatorCheck").style.visibility="visible";
        $.ajax({
            url: 'place_submit',
            type: 'POST',
            data: {'departure': departure, 'destination': destination,
            'csrfmiddlewaretoken':csrftoken,
            },
            datatype: 'json',
            success: function(data){
                textList = data;
                $('#amenitiesOnMap div').css('display','none');
                //엘리베이터 시간주기
                elevTimePlus(textList);
                ElevPage('use');
                drawLine(textList["elevatorUse"]["coordinates"]);
            }

        });
    }
}


// 엘리베이터 실제시간주기
function elevTimePlus(textList) {
    let seconds = parseInt(textList["elevatorUse"]["distance"]);
    for(let i = 0; i<textList["elevatorUse"]["route"].length; i++){
            if(textList["elevatorUse"]["route"][i].includes("엘리베이터")){
                 seconds += 60;//한번탈때 엘리베이터 두번주므로 120초를 두번에 나눠서 준다
            }
    }
    textList["elevatorUse"]["distance"] = seconds;
}

function amenitiesShow(name,e){
    if(e.target.checked){
        document.getElementById(name).style.visibility = 'visible';
    } else{
        document.getElementById(name).style.visibility = 'hidden';
    }
}

let amenitiesDic = {
    'cafe':[["R동 L층 카페나무",187,430],["와우관 4층 카페나무",437,92],["R동 2층 카페 그라찌에",265,417],["R동 2층 다과점 파프라카",204,486],["카페 캠퍼",910,507],["A동 1층 카페드림",898,274],["C동 8층 간이카페",999,198],["중앙도서관 2층 북카페",535,116]],
    'convenienceStore':[["R동 B2 홍익대학서적",228,451],["와우관 4층 편의점",437,92],["R동 3층 편의점",226,432],["R동 L층 한가람 문구센터",186,383],["제2기숙사 지하1층 편의점",938,470]],
    'restaurant':[["제2기숙사 학생식당",936,474],["향차이",916,531],["메리킹",165,458]],
    'medicalRoom':[["약국(원이 약국)",916,550],["건강진료센터",570,259]],
    'readingRoom':[["T동 3,4층 열람실",821,499],["A동 2층 열람실",823,227],["R동 8층 열람실",257,531],["중앙도서관 열람실",521,219]]
}
function amenitiesInMap() {
    //지도위 편의시설 전부 삭제
    $('#amenitiesOnMap div').empty();
    //위치조정
    //위치조정은 기본 1300*700px의 지도 위치를 기준으로 한다.
    //이함수는 페이지 로드될떄와 화면크기가 변할때 실행된다.
    
    //화면비율
    let widthRatio = document.getElementById('background').getBoundingClientRect().width / 1300;
    let heightRatio = document.getElementById('background').getBoundingClientRect().height / 700;
    for(let key in amenitiesDic){
        for(let i=0; i < amenitiesDic[key].length;i++){
            //제이쿼리를 통해 img의 속성와 css를 주고 div안에 넣어준다
            $('<img>', {
                src: '../../static/logo/position.png',
                title:amenitiesDic[key][i][0],
                width: 44*widthRatio+'px',
                height: 44*heightRatio+'px'
                }).css('left', widthRatio*amenitiesDic[key][i][1]).css('top',heightRatio*amenitiesDic[key][i][2]).css('position','absolute').appendTo(document.getElementById(key));
        }
    }
}
amenitiesInMap();
//화면 크기 변할 때 편의시설 조정
window.onresize = function() {
    amenitiesInMap();
}

let amenitiesInCardDic={

};
//카드
function getCardContents() {
    $.ajax({
        url: 'card_contents',
        type: 'POST',
        data: {
        'csrfmiddlewaretoken':csrftoken,
        },
        datatype: 'json',
        success: function(cardData){
            amenitiesInCardDic = cardData;
            showCardContents(amenitiesInCardDic);
        }

    });
}

function showCardContents(contents){

}
