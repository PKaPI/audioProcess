/**
 * Created by pi on 2016/11/28.
 */
var recorder;
var audio = document.querySelector('audio');
var lSrc;
var isSrc1=false;
var isSrc2=false;
var src1,src2;
function startRecording() {
    HZRecorder.get(function (rec) {
        recorder = rec;
        recorder.start();
    });
}

function stopRecording() {
    recorder.stop();
}

function playRecording() {
    recorder.play(audio);
    lSrc=recorder.audioUrl();
    loadMusic();
}

function uploadAudio() {
    recorder.upload("Handler1.ashx", function (state, e) {
        switch (state) {
            case 'uploading':
                //var percentComplete = Math.round(e.loaded * 100 / e.total) + '%';
                break;
            case 'ok':
                //alert(e.target.responseText);
                alert("上传成功");
                break;
            case 'error':
                alert("上传失败");
                break;
            case 'cancel':
                alert("上传被取消");
                break;
        }
    });
}
function loadMusic(){
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'red'
    });

    var wavesurfer2 = WaveSurfer.create({
        container: '#waveform2',
        waveColor: 'green',
        progressColor: 'red'
    });
    wavesurfer.load(lSrc);
    wavesurfer2.load('./audiofile/test.mp3');
    wavesurfer.on('ready', function () {
        var canvas=$("#waveform canvas");
        src1=canvas[0].toDataURL("image/png");
        isSrc1=true;
        if(isSrc2){
            runSorce();
        }
    });
    wavesurfer2.on('ready', function () {
        var canvas2=$("#waveform2 canvas");
        src2=canvas2[0].toDataURL("image/png");
        isSrc2=true;
        if(isSrc1){
            runSorce();
        }
    });
}

function  runSorce() {
    var file1;
    var file2;
    var resembleControl;
    var file_src1 = src1; //可修改
    var file_src2 = src2;
    isSrc1=false;
    isSrc2=false;
    function onComplete(data) {

        var time = Date.now();
        var diffImage = new Image();
        diffImage.src = data.getImageDataUrl();

        $('#image-diff').html(diffImage);

        $(diffImage).click(function () {
            window.open(diffImage.src, '_blank');
        });

        if (data.misMatchPercentage == 0) {
            $('#diff-results').html('These images are the same!');
        } else {
            $('#diff-results').html('The second image is <span id="mismatch">' + data.misMatchPercentage + '</span>% different compared to the first.');
        }
    }


    (function () {
        var xhr = new XMLHttpRequest();
        var xhr2 = new XMLHttpRequest();
        var done = $.Deferred();
        var dtwo = $.Deferred();

        xhr.open('GET', file_src1, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            done.resolve(this.response);
        };
        xhr.send();

        xhr2.open('GET', file_src2, true);
        xhr2.responseType = 'blob';
        xhr2.onload = function (e) {
            dtwo.resolve(this.response);
        };
        xhr2.send();



        $.when(done, dtwo).done(function (file, file1) {
            if (typeof FileReader === 'undefined') {
                resembleControl = resemble(file_src1).compareTo(file_src2).onComplete(onComplete);
            } else {
                resembleControl = resemble(file).compareTo(file1).onComplete(onComplete);
            }
        });

        return false;

    }());
}