let time_of_snap = new Array();
let data_of_ram = new Array();
let size_of_page = new Array();
let loud_marks = new Array();
let quo_marks = new Array();
let th_marks = new Array();
let br_marks = new Array();
let quo_m_marks = new Array();
let blur_marks = new Array();

function log_export(){
  time_of_snap.unshift("Time of Snap");
  data_of_ram.unshift("Ram");
  size_of_page.unshift("Size of page")
  quo_marks.unshift("QUO")
  loud_marks.unshift("LOUD")
  th_marks.unshift("TH")
  br_marks.unshift("brit");
  quo_m_marks.unshift("quo_image");
  blur_marks.unshift("blur");
   rows = [
    time_of_snap,data_of_ram,size_of_page,quo_marks,loud_marks,th_marks,
    br_marks,quo_m_marks,blur_marks
  ];
  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(function(rowArray) {
    let row = rowArray.join(";");
    csvContent += row + "\r\n";
  });
  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}
function addtoArrayssound(quo, loud, th){
  quo_marks.push(quo);
  loud_marks.push(loud);
  th_marks.push(th);
}

function imageAppendarray(brit, quo, blur){
  br_marks.push(brit);
  quo_m_marks.push(quo);
  blur_marks.push(blur);
}
