/**
 * Created by pi on 2016/11/28.
 */
var recorder;
var audio =$('audio')[0];
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
    console.log(lSrc);
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
function loadMusic(){  //加载音乐绘制音波图形
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'green',
        progressColor: 'red'
    });

    var wavesurfer2 = WaveSurfer.create({
        container: '#waveform2',
        waveColor: 'green',
        progressColor: 'red'
    });
    wavesurfer.load(lSrc);
    wavesurfer2.load('./audiofile/shenhua2.mp3');
    wavesurfer.on('ready', function () {   //监听音乐加载事件
        var canvas=$("#waveform canvas");
        src1=canvas[0].toDataURL("image/png");
        isSrc1=true;
        if(isSrc2){      
            runSorce();  //异步函数处理
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
    isSrc1=false;
    isSrc2=false;
    var compareNum = [];
    // wavesurfer2.play();
    // wavesurfer.play();
    resembleControl = resemble(src1).compareTo(src2).onComplete(onComplete);
    function onComplete(data) {  
        var time = Date.now();
        var diffImage = new Image();
        diffImage.src = data.getImageDataUrl();
        $('#image-diff').html(diffImage);

        $(diffImage).click(function () {
            window.open(diffImage.src, '_blank');
        });
        compareRsult(src2,0,128,0,255);
        compareRsult(data.getImageDataUrl(),0,128,0,255);
        
    }
    function compareRsult(url,r,g,b,a){
            var canvas=document.createElement('canvas');
            var ctxt = canvas.getContext('2d');
            var img = new Image;
            var data; 
            compare={
                R:r,
                G:g,
                B:b,
                A:a,
                num:0
            };
            var isSucc=false;
            img.onload = function(){
                canvas.setAttribute("width",img.width);
                canvas.setAttribute("height",img.height);
                ctxt.drawImage(img, 0, 0);
                compare.num=0;
                data = ctxt.getImageData(0, 0, img.width, img.height).data;//读取整张图片的像素。
                for(var i =0,len = data.length; i<len;i+=4){
                    var red = data[i],//红色色深
                    green = data[i+1],//绿色色深
                    blue = data[i+2];//蓝色色深
                    alpha=data[i+3];
                    if(red==r&&green==g&&blue==b&&alpha==a){
                        compare.num += 1;
                    }
                }
                compareNum.push(compare.num);
                if(compareNum.length == 2) { //数组比较
                    if(compareNum[0]<compareNum[1]){
                        percent=Math.ceil(compareNum[0]/compareNum[1]*10000)/100;
                    }else{
                        percent=Math.ceil(compareNum[1]/compareNum[0]*10000)/100;  
                    }
                    
                    if (percent == 1) {
                        $('#diff-results').html('These images are the same!');
                    } else {
                         $('#diff-results').html('音频相识度：<span id="mismatch">' + percent + '</span>% ');
                    }
                }
            }
            img.src = url;//src也可以是从文件选择控件中取得
            

    }

    // (function () {
    //     var xhr = new XMLHttpRequest();
    //     var xhr2 = new XMLHttpRequest();
    //     var done = $.Deferred();
    //     var dtwo = $.Deferred();

    //     xhr.open('GET', src1, true);
    //     xhr.responseType = 'blob';
    //     xhr.onload = function (e) {
    //         done.resolve(this.response);
    //     };
    //     xhr.send();

    //     xhr2.open('GET', src2, true);
    //     xhr2.responseType = 'blob';
    //     xhr2.onload = function (e) {
    //         dtwo.resolve(this.response);
    //     };
    //     xhr2.send();



    //     $.when(done, dtwo).done(function (file, file1) {
    //         if (typeof FileReader === 'undefined') {
    //             resembleControl = resemble(src1).compareTo(src2).onComplete(onComplete);
    //         } else {
    //             resembleControl = resemble(file).compareTo(file1).onComplete(onComplete);
    //         }
    //     });

    //     return false;

    // }());
}