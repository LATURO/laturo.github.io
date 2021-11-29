(function() {
  var script = document.createElement('script');
  script.onload = function() {

    var stats = new MemoryStats();

    var elem = stats.domElement;
    elem.style.position = 'fixed';
    elem.style.right    = '0px';
    elem.style.bottom   = '0px';
    elem.style.zIndex   = 100000;

    document.body.appendChild( stats.domElement );

    requestAnimationFrame(function rAFloop(){
      stats.update();
      requestAnimationFrame(rAFloop);
    });
  };

  script.src = "https://rawgit.com/paulirish/memory-stats.js/master/memory-stats.js";
  document.head.appendChild(script);
})();


console.log(navigator.hardwareConcurrency)
let video;
let k = 6000;
let webcamStream;
let audioContext = window.AudioContext || window.webkitAudioContext;
this.audioContext = new AudioContext();
let timer, analyzer;
let prev_img = undefined;
const MAX_THDN = 0.04;
let THDN;

/*import {
    mse,
    psnr,
    snr,
    ssim_uqi,
    brightness,
    blured_1,
    blured_2,
    thdn,
    snr_audio
} from './metrics'*/

//функция запускается при загрузке страницы
function settiming() {
    k = document.getElementById("timing").value * 1000;
    document.getElementById("info").value="Интервал: "+k / 1000 +" секунд";
    if(isNaN(k)){
      k = 10000;
    }
      document.getElementById("info").value="Интервал: "+k / 1000 +" секунд";
  }
  function videoplayer(){
    fileInput = document.getElementById('drop')
    l = document.getElementById("timing")
    l.setAttribute("disabled","disabled")
      selectedFile = fileInput.files[0];
    video = document.createElement('video');

    video.setAttribute("controls","controls");
    video.setAttribute("width","640px");
    video.setAttribute("height","480px");
    video.src = URL.createObjectURL(selectedFile);
    video.autoplay = true;
    video.muted = false;
    video.playsinline = true;
    document.getElementById('camera').append(video);
    ctx = new AudioContext();
    source = ctx.createMediaElementSource(video);
    source.crossOrigin = "use-credentials";
    (analyser = ctx.createAnalyser()), (processor = ctx.createScriptProcessor(1024, 1, 1));
    source.connect(analyser);
    source.connect(ctx.destination);
    source.connect(processor);
    processor.connect(ctx.destination);
    tensor = new Uint8Array(analyser.frequencyBinCount);
    console.log('sampleRate ' + ctx.sampleRate);
    const a = tf.tensor1d([1, 2, 3]);
    const time_m = tf.range(0, (2 * Math.PI) / 1000, 1 / ctx.sampleRate);
    const signal = tf.sin(time_m.mul(tf.scalar(1000)));
    THDN = thdn(signal, ctx.sampleRate);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: ctx,
        source: source,
        bufferSize: 16384,
        featureExtractors: ['energy', 'zcr', 'loudness', 'spectralFlatness'],
        callback: (features) => {
            console.log(features);

            let data = {
                loudness: parseFloat(features.loudness.total).toFixed(2),
                zcr: features.zcr,
                energy: parseFloat(features.energy).toFixed(2),
                snr: parseFloat(snr_audio(tensor)).toFixed(2),
                spectralFlatness: parseFloat(features.spectralFlatness).toFixed(3),
            };
            let res = {
                loud: Math.round((genergy(data.energy) + gloudness(data.loudness)) / 2),
                quo: Math.round(
                    (gzcr(data.zcr) +
                        gsnr(data.snr) +
                        gspectralflatness(data.spectralFlatness)) /
                        3,
                ),
                thdn: gthdn(THDN),
            };
            console.log(res);
            appendSoundRow(res);
            analyzer.stop();
        },
    });
    processor.onaudioprocess = function () {
        analyser.getByteFrequencyData(tensor);
        requestAnimationFrame(function rAFloop(){
          stats.update();
          requestAnimationFrame(rAFloop);
        });
    };

    setTimeout(() => {
        prev_img = snapshot();
    }, 1000);

    //установка интервала (в данном случае 60с) для использования метрик
    timer = setInterval(() => {
        doMetrics();
        analyzer.start();
    }, k);

    //создание таблицы с метриками (если она еще не создана)
    if (getComputedStyle(document.getElementById('table')).height == '0px') {
        createPicTable();
        createSoundTable();
    }

  }
  function startCam() {
      //получение потока с веб-камеры
      l = document.getElementById("timing")
      l.setAttribute("disabled","disabled")
      document.getElementById("timing").style.display = 'none';
      document.getElementById("drop").style.display = 'none';
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
      navigator.mediaDevices
          .getUserMedia({
              video: true,
              audio: true,
          })
          .then((stream) => {
              video = document.createElement('video');
              video.muted = true;
              video.autoplay = true;
              document.getElementById('camera').append(video);
              ctx = new AudioContext();
              source = ctx.createMediaStreamSource(stream);
              (analyser = ctx.createAnalyser()), (processor = ctx.createScriptProcessor(1024, 1, 1));
              source.connect(analyser);
              source.connect(processor);
              processor.connect(ctx.destination);

              //вспомогательная кнопка для управления
              let bttn = document.createElement('input');
              bttn.setAttribute("type","button");
              bttn.setAttribute("value","Stop Cam");
              bttn.setAttribute('onclick', 'stopCam()');
              bttn.setAttribute('id', 'bttn');
              bttn.setAttribute('class','col btn btn-warning')
              document.getElementById('buttns').append(bttn);

              tensor = new Uint8Array(analyser.frequencyBinCount);
              console.log('sampleRate ' + ctx.sampleRate);
              const a = tf.tensor1d([1, 2, 3]);
              const time_m = tf.range(0, (2 * Math.PI) / 1000, 1 / ctx.sampleRate);
              const signal = tf.sin(time_m.mul(tf.scalar(1000)));
              THDN = thdn(signal, ctx.sampleRate);

              analyzer = Meyda.createMeydaAnalyzer({
                  audioContext: ctx,
                  source: source,
                  bufferSize: 16384,
                  featureExtractors: ['energy', 'zcr', 'loudness', 'spectralFlatness'],
                  callback: (features) => {
                      console.log(features);
                      let data = {
                          loudness: parseFloat(features.loudness.total).toFixed(2),
                          zcr: features.zcr,
                          energy: parseFloat(features.energy).toFixed(2),
                          snr: parseFloat(snr_audio(tensor)).toFixed(2),
                          spectralFlatness: parseFloat(features.spectralFlatness).toFixed(3),
                      };
                      let res = {
                          loud: Math.round((genergy(data.energy) + gloudness(data.loudness)) / 2),
                          quo: Math.round(
                              (Math.min(gzcr(data.zcr),
                                  gsnr(data.snr),
                                  gspectralflatness(data.spectralFlatness)) + Math.max(gzcr(data.zcr),
                                      gsnr(data.snr),
                                      gspectralflatness(data.spectralFlatness)))/ 2,
                          ),
                          thdn: gthdn(THDN),
                      };
                      console.log(res);
                      console.log("zcr: "+ " "+gzcr(data.zcr) + " snr: "+
                          gsnr(data.snr) +" sf: "+
                          gspectralflatness(data.spectralFlatness));
                      appendSoundRow(res);
                      analyzer.stop();
                  },
              });
              processor.onaudioprocess = function () {
                  analyser.getByteFrequencyData(tensor);
              };
              video.srcObject = stream;
              video.play();

              webcamStream = stream;

              setTimeout(() => {
                  prev_img = snapshot();
              }, 1000);

              //установка интервала (в данном случае 60с) для использования метрик
              timer = setInterval(() => {
                  doMetrics();
                  analyzer.start();
              }, k);

              //создание таблицы с метриками (если она еще не создана)
              if (getComputedStyle(document.getElementById('table')).height == '0px') {
                  createPicTable();
                  createSoundTable();
              }
          })
          .catch((error) => {
              console.log('navigator.getUserMedia error: ', error);
          });
  }

//функция прекращения передачи потока с веб-камеры
function stopCam() {
    webcamStream.getTracks()[0].stop();
    webcamStream.getTracks()[1].stop();
    analyzer.stop();
    //остановка интервала
    clearInterval(timer);
    document.getElementById('camera').removeChild(video);
    let bttn = document.getElementById('bttn');
    bttn.innerHTML = 'Restart Cam';
    bttn.setAttribute('onclick', 'startCam(); document.getElementById("buttns").removeChild(bttn)');
}

//основная функция работы с метриками
async function doMetrics() {
    let img1 = prev_img;
    let img2 = snapshot();

    //передача в функции, которые работают с изображениями
    let br = brightness(img2);
    let bl_2 = blured_2(img2);

    //внутри встроенного в tf GC работаем с тензорами изображений
    tf.tidy(() => {
        let t1 = tf.browser.fromPixels(img1);
        let t2 = tf.browser.fromPixels(img2);

        let mse1 = mse(t1, t2).dataSync(0) / 255;
        let psnr1 = psnr(mse1);
        let snr1 = snr(t1, t2);
        let { ssim, uqi } = ssim_uqi(t1, t2);

        let res_quo = Math.round((fmse(mse1) + fpsnr(psnr1) + fsnr(snr1) + fssim(ssim)) / 4);
        let res_brit = Math.round(br / 2);

        let res = {
            quo: res_quo,
            brit: res_brit,
            blur: bl_2,
        };

        appendPicRow(res);

        console.log(res);
    });

    prev_img = img2;
}

function pause(milliseconds) {
    var dt = new Date();
    while (new Date() - dt <= milliseconds) {}
}

//получение стоп-кадра с видео потока
function snapshot() {
    ts = performance.now();
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    document.body.removeChild(canvas);

    let im = document.getElementById('img');
    im.style.display = 'inline';
    im.src = canvas.toDataURL();

    requestAnimationFrame(function rAFloop(){
      stats.update();
      requestAnimationFrame(rAFloop);
    });
    ts = performance.now() - ts;
    time_of_snap.push(ts);
    data_of_ram.push(performance.memory.usedJSHeapSize / (1024*1024));
    size_of_page.push(document.documentElement.innerHTML.length / (1024 * 1024));
    return canvas;
}

//создание тега таблицы и отображение заголовка
function createPicTable() {
    let tableHeaders = ['Качество', 'Яркость', 'Размытость'];
    let table = document.createElement('table');
    table.setAttribute('id', 'pic_tbl');
    let tableHead = document.createElement('thead');
    let tableRow = document.createElement('tr');
    let caption = document.createElement('caption');
    caption.innerText = 'Качество изображения';
    table.append(caption);

    tableHeaders.forEach((header) => {
        let th = document.createElement('th');
        th.innerText = header;
        th.setAttribute('class', 'col');
        tableRow.append(th);
    });
    table.setAttribute('class', 'table table-bordered col p-3');
    //tableRow.setAttribute('class', 'row');
    tableHead.append(tableRow);
    table.append(tableHead);

    let tableBody = document.createElement('tbody');
    table.append(tableBody);
    document.getElementById('table').append(table);
}

function createSoundTable() {
    let tableHeaders = ['Качество', 'Громкость', 'Качество микрофона'];
    let table = document.createElement('table');
    table.setAttribute('class', 'table');
    table.setAttribute('id', 'sound_tbl');
    let tableHead = document.createElement('thead');
    let tableRow = document.createElement('tr');
    let caption = document.createElement('caption');

    caption.innerText = 'Качество звука';
    table.append(caption);

    tableHeaders.forEach((header) => {
        let th = document.createElement('th');
        th.innerText = header;
        th.setAttribute('scope','col')
        tableRow.append(th);
    });


    tableHead.append(tableRow);
    table.append(tableHead);

    let tableBody = document.createElement('tbody');
    table.append(tableBody);
    table.setAttribute('class', 'table table-bordered col p-3');
    document.getElementById('table').append(table);
    stats.update();
}

//функция для добавления строки в таблицу со значениями метрик
function appendPicRow(data) {
    let newRow = document.createElement('tr');
    let quo = document.createElement('td');
    quo.setAttribute('class','border')
    switch (data.quo) {
        case 1:
            quo.innerText = 'Очень хорошо';
            break;
        case 2:
            quo.innerText = 'Хорошо';
            break;
        case 3:
            quo.innerText = 'Нормально';
            break;
        case 4:
            quo.innerText = 'Плохо';
            break;
        case 5:
            quo.innerText = 'Очень плохо';
    }

    let brit = document.createElement('td');
    brit.setAttribute('class','border')
    switch (data.brit) {
        case 0:
            brit.innerText = 'Очень темно';
            break;
        case 1:
            brit.innerText = 'Очень темно';
            break;
        case 2:
            brit.innerText = 'Темно';
            break;
        case 3:
            brit.innerText = 'Нормально';
            break;
        case 4:
            brit.innerText = 'Ярко';
            break;
        case 5:
            brit.innerText = 'Очень ярко';
    }

    let blur = document.createElement('td');
    blur.setAttribute('class','border')
    switch (data.blur) {
        case 1:
            blur.innerText = 'Размыто';
            break;
        case 5:
            blur.innerText = 'Не размыто';
    }

    let table = document.getElementById('pic_tbl');

    if (table.rows.length == 2) table.deleteRow(1);
    imageAppendarray(data.quo,data.brit,data.blur);
    newRow.append(quo, brit, blur);
    table.append(newRow);
}

function appendSoundRow(data) {
    let newRow = document.createElement('tr');
    let quo = document.createElement('td');
    quo.setAttribute('class','border')
    switch (data.quo) {
        case 1:
            quo.innerText = 'Очень хорошо';
            break;
        case 2:
            quo.innerText = 'Хорошо';
            break;
        case 3:
            quo.innerText = 'Нормально';
            break;
        case 4:
            quo.innerText = 'Плохо';
            break;
        case 5:
            quo.innerText = 'Очень плохо';
            break;
        default:
            quo.innerText = 'Очень плохо';
    }

    let loud = document.createElement('td');
    loud.setAttribute('class','border')
    switch (data.loud) {
        case 1:
            loud.innerText = 'Очень тихо';
            break;
        case 2:
            loud.innerText = 'Тихо';
            break;
        case 3:
            loud.innerText = 'Нормально';
            break;
        case 4:
            loud.innerText = 'Громко';
            break;
        case 5:
            loud.innerText = 'Очень громко';
    }

    let th = document.createElement('td');
    th.setAttribute('class','border')
    switch (data.thdn) {
        case 1:
            th.innerText = 'Плохо';
            break;
        case 5:
            th.innerText = 'Хорошо';
    }

    let table = document.getElementById('sound_tbl');

    if (table.rows.length == 2) table.deleteRow(1);

    newRow.append(quo, loud, th);
    addtoArrayssound(data.quo, data.loud, data.thdn);
    table.append(newRow);
}

function fmse(mse) {
    if (mse >= 0 && mse < 0.1) return 1;
    else if (mse >= 0.1 && mse < 10) return 2;
    else if (mse >= 10 && mse < 20) return 3;
    else if (mse >= 20 && mse < 30) return 4;
    else return 5;
}

function fsnr(snr) {
    if (snr < 1.4) return 5;
    else if (snr >= 1.4 && snr < 1.5) return 4;
    else if (snr >= 1.5 && snr < 1.6) return 3;
    else if (snr >= 1.6 && snr < 1.65) return 2;
    else return 1;
}

function fpsnr(psnr) {
    if (psnr < 30) return 5;
    else if (psnr >= 30 && psnr < 35) return 4;
    else if (psnr >= 35 && psnr < 40) return 3;
    else if (psnr >= 40 && psnr < 50) return 2;
    else return 1;
}

function fssim(ssim) {
    if (ssim > 0.99) return 1;
    else if (ssim <= 0.99 && ssim > 0.98) return 2;
    else if (ssim <= 0.98 && ssim > 0.97) return 3;
    else if (ssim <= 0.97 && ssim > 0.96) return 4;
    else return 5;
}

function gsnr(a) {
    if (a >= 0 && a <= 0.15) {
        return 1;
    }
    if (a > 0.15 && a <= 0.24) {
        return 2;
    }
    if (a > 0.24 && a <= 0.36) {
        return 3;
    }
    if (a > 0.36 && a <= 0.41) {
        return 4;
    }
    if (a > 0.41) {
        return 5;
    } else {
        return 0;
    }
}

function gloudness(a) {
    if (a >= 0 && a <= 18) {
        return 1;
    }
    if (a > 18 && a <= 36) {
        return 2;
    }
    if (a > 36 && a <= 72) {
        return 3;
    }
    if (a > 72 && a <= 100) {
        return 4;
    }
    if (a > 100) {
        return 5;
    } else {
        return 0;
    }
}

function genergy(a) {
    if (a >= 0 && a <= 110) {
        return 1;
    }
    if (a > 110 && a <= 550) {
        return 2;
    }
    if (a > 550 && a <= 1110) {
        return 3;
    }
    if (a > 1110 && a <= 1650) {
        return 4;
    }
    if (a > 1) {
        return 5;
    } else {
        return 0;
    }
}

function gzcr(a) {
    if (a >= 0 && a <= 3276) {
        return 1;
    }
    if (a > 3276 && a <= 6554) {
        return 2;
    }
    if (a > 6554 && a <= 9830) {
        return 3;
    }
    if (a > 9830 && a <= 16384) {
        return 4;
    }
    if (a > 16384) {
        return 5;
    } else {
        return 0;
    }
}

function gspectralflatness(a) {
    if (a >= 0 && a <= 0.1) {
        return 1;
    }
    if (a > 0.1 && a <= 0.2) {
        return 2;
    }
    if (a > 0.2 && a <= 0.3) {
        return 3;
    }
    if (a > 0.3 && a <= 0.4) {
        return 4;
    } else if (a > 0.4) {
        return 5;
    }
}

function gthdn(THDN) {
    if (THDN > MAX_THDN) {
        return 1;
    } else {
        return 5;
    }
}
