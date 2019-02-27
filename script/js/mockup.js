/*Copyright Anthony Beaumont 
  December 2017 
*/

var cache = document.createElement('canvas');
var ctxCache = cache.getContext('2d');

var dlCache = document.createElement('canvas');
var ctxdlCache = dlCache.getContext('2d');

function downscale(img, ratio, callback){

  var resizer = window.pica();

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    ctx.canvas.width = img.width*ratio;
    ctx.canvas.height = img.height*ratio;
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

    resizer.resize(img, canvas, {
      quality: 2,
      alpha: true,
      unsharpAmount: 0
    })
    .then(result => callback(canvas));

}

function rowBlank(imageData, width, y) {
        for (var x = 0; x < width; ++x) {
            if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
        }
        return true;
    }

    function columnBlank(imageData, width, x, top, bottom) {
        for (var y = top; y < bottom; ++y) {
            if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
        }
        return true;
    }

function trim(canvas, mockup = false) {

        var ctx = canvas.getContext("2d");
        var width = canvas.width;
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var top = 0, bottom = imageData.height, left = 0, right = imageData.width;

        while (top < bottom && rowBlank(imageData, width, top)) ++top;
        while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1)) --bottom;
        while (left < right && columnBlank(imageData, width, left, top, bottom)) ++left;
        while (right - 1 > left && columnBlank(imageData, width, right - 1, top, bottom)) --right;

        var trimmed = ctx.getImageData(left, top, right - left, bottom - top);

        if (mockup) {
          
           var maxWidth = parseFloat($('#design').css("width"))*2;
           var maxHeight = parseFloat($('#design').css("height"))*2;
           var ratio = ratioCalc(trimmed.width,trimmed.height,maxWidth,maxHeight);
           var copy = document.createElement('canvas');
           var copyCtx = copy.getContext('2d');
           copyCtx.canvas.width = trimmed.width;
           copyCtx.canvas.height = trimmed.height;
           copyCtx.clearRect(0,0,copyCtx.canvas.width, copyCtx.canvas.height);
           copyCtx.putImageData(trimmed, 0, 0);

           downscale(copy, ratio, drawn);
           
        }
        else {
        
          ctxCache.canvas.width = trimmed.width;
          ctxCache.canvas.height = trimmed.height;
          ctxCache.clearRect(0,0,ctxCache.canvas.width, ctxCache.canvas.height);
          ctxCache.putImageData(trimmed, 0, 0);
          
          drawn();
        
        }
}

function sharpen(canvas, mix, callback=false) {

  var ctx = canvas.getContext('2d');
  var w = ctx.canvas.width;
  var h = ctx.canvas.height;

    var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(w, h),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, w, h).data,
        y = h;

    while (y--) {

        x = w;

        while (x--) {

            var sy = y,
                sx = x,
                dstOff = (y * w + x) * 4,
                r = 0,
                g = 0,
                b = 0,
                a = 0;

            for (var cy = 0; cy < katet; cy++) {
                for (var cx = 0; cx < katet; cx++) {

                    var scy = sy + cy - half;
                    var scx = sx + cx - half;

                    if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                        var srcOff = (scy * w + scx) * 4;
                        var wt = weights[cy * katet + cx];

                        r += srcBuff[srcOff] * wt;
                        g += srcBuff[srcOff + 1] * wt;
                        b += srcBuff[srcOff + 2] * wt;
                        a += srcBuff[srcOff + 3] * wt;
                    }
                }
            }

            dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
            dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
            dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix)
            dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
        }
    }

    ctx.putImageData(dstData, 0, 0);
    
    if (callback == false) {
      $('#popup').popup('hide');
      setTimeout(function() { 
        $("#template-box-overlay").hide();
      }, 200); 
      $('.notice', "#img-drop-zone").show();
      $('.loading', "#img-drop-zone").hide();
      $(".btn:nth-child(2)","#buttons").alterClass("disable","enable");
      
      
      
    }
    else {
      callback();
    }
}

function mirrorImage(canvas, image, sharpLevel, x, y, horizontal, vertical, callback=false){
    var ctx = canvas.getContext('2d');
    ctx.save();  // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0, // set the direction of x axis
        0, vertical ? -1 : 1,   // set the direction of y axis
        x + horizontal ? image.width : 0, // set the x origin
        y + vertical ? image.height : 0   // set the y origin
    );
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(image,0,0);
    ctx.restore(); // restore the state as it was when this function was called
    
    if (callback == false) {
      sharpen(canvas, parseInt(sharpLevel) * 0.01);
    } else {
      sharpen(canvas, parseInt(sharpLevel) * 0.01, callback);
    }
}
  
function drawn(mockup=false){

  var postFXLevel = getPostFXValueFromUI();

 if (($("#design").width() > 0 && $("#design").height() > 0) || uploadedFileEncoded != null){
  console.log("drawn");

    if (postFXLevel.constructor === Array) {

      if ( postFXLevel[0] < 0 && fxLevel[0] > 100 ) { fxLevel[0] = 10; }
      if ( postFXLevel[1] < 0 && fxLevel[1] > 100 ) { fxLevel[1] = 0; }
      if ( postFXLevel[2] < 0 && fxLevel[2] > 200 ) { fxLevel[2] = 100; }
      if ( postFXLevel[3] < 0 && fxLevel[3] > 200 ) { fxLevel[3] = 100; }
      if ( postFXLevel[4] < 0 && fxLevel[4] > 200 ) { fxLevel[4] = 100; }
      if ( postFXLevel[5] < 0 && fxLevel[5] > 100 ) { fxLevel[5] = 0; }
      if ( postFXLevel[6] < 0 && fxLevel[6] > 360 ) { fxLevel[6] = 0; }
      if ( postFXLevel[7] < 0 && fxLevel[7] > 100 ) { fxLevel[7] = 100; }
      if ( postFXLevel[8] < 0 && fxLevel[8] > 10 ) { fxLevel[8] = 0; }
      if ( postFXLevel[9] < 0 && fxLevel[9] > 100 ) { fxLevel[9] = 0; }
      if ( !postFXLevel[10] == "n" || !postFXLevel[10] == "h" || !postFXLevel[10] == "v" || !postFXLevel[10] == "b" ) { postFXLevel[10] = "n"; }

    }
    else {
      var postFXLevel = [10,0,100,100,100,0,0,100,0,0,"n"];
    }
    
    if (mockup == false) {
      var canvas = document.getElementById('design');
      var ctx = canvas.getContext('2d');
      ctx.canvas.width = ctxCache.canvas.width;
      ctx.canvas.height = ctxCache.canvas.height;
      ctx.clearRect(0,0,canvas.width, canvas.height);
    }
    else {
    
      var ctx = dlCache.getContext('2d');
      ctx.canvas.width = mockup.width;
      ctx.canvas.height = mockup.height;
      ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    
    }
    
    ctx.filter = 'invert('+postFXLevel[1]+'%) brightness('+postFXLevel[2]+'%) contrast('+postFXLevel[3]+'%) saturate('+postFXLevel[4]+'%) grayscale('+postFXLevel[5]+'%) hue-rotate('+postFXLevel[6]+'deg) opacity('+postFXLevel[7]+'%) blur('+postFXLevel[8]+'px) sepia('+postFXLevel[9]+'%)';
    
    if (mockup == false) {
      ctx.drawImage(cache, 0, 0);
    } else {
      ctx.drawImage(mockup, 0, 0);
    }

    var horizontal = false; 
    var vertical = false;

   if ( postFXLevel[10] == "h" ) {
      horizontal = true; 
      vertical = false;
   }
   else if ( postFXLevel[10] == "v" ) {
      horizontal = false; 
      vertical = true;
   }
   else if ( postFXLevel[10] == "b" ) {
      horizontal = true; 
      vertical = true;
   }
   
   if (mockup == false) {
      mirrorImage(canvas, ctxCache.canvas, postFXLevel[0], 0, 0, horizontal, vertical);
    } else {
      mirrorImage(dlCache, mockup, postFXLevel[0], 0, 0, horizontal, vertical, addBackgroundToMockup);
   } 
   
 }

}

function getPostFXValueFromUI(){

  var postFXLevel = [ $("#sharpenLevel").val(), $("#invertLevel").val(), $("#brightLevel").val(), $("#contrastLevel").val(), $("#saturateLevel").val(), $("#grayscaleLevel").val(), $("#hueLevel").val(), $("#opacityLevel").val(), $("#blurLevel").val(),$("#sepiaLevel").val(),$('input[name=flip]:checked', '#flip-control').val() ];

  return postFXLevel;
}

//var selectColor = [0,0,255];


var colorRemoved = [];
function removeColor(canvas,color, mockup=false){
    var ctx = canvas.getContext('2d');
    var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        pix = canvasData.data;
    
    for (var i = 0, n = pix.length; i <n; i += 4) {
        if(isApprox(pix[i], color[0], 155) &&
           isApprox(pix[i+1], color[1], 155) &&
           isApprox(pix[i+2], color[2], 155)){
             pix[i+3] = 0;   
        }
    }
    
    ctx.putImageData(canvasData, 0, 0);
    
    if (mockup == false) {
      colorRemoved.push(color);
      $('#design-wrapper').draggable( 'enable' );
      $("#design-wrapper").removeClass("colorPick");
      $('#design-wrapper').prop("style").removeProperty("top");
      $('#design-wrapper').prop("style").removeProperty("left");
      $('#design-wrapper').alterClass( 'center-*', 'center-b' );
    }
    else {
    
    }
}

function isApprox(a, b, range) {
  var d = a - b;
  return d < range && d > -range;
}
function colorValues(color)
{
    if (color === '')
        return;
    if (color.toLowerCase() === 'transparent')
        return [0, 0, 0, 0];
    if (color[0] === '#')
    {
        if (color.length < 7)
        {
            // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
        }
        return [parseInt(color.substr(1, 2), 16),
            parseInt(color.substr(3, 2), 16),
            parseInt(color.substr(5, 2), 16),
            color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
    }
    if (color.indexOf('rgb') === -1)
    {
        // convert named colors
        var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
        var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
        temp_elem.style.color = flag;
        if (temp_elem.style.color !== flag)
            return; // color set failed - some monstrous css rule is probably taking over the color of our object
        temp_elem.style.color = color;
        if (temp_elem.style.color === flag || temp_elem.style.color === '')
            return; // color parse failed
        color = getComputedStyle(temp_elem).color;
        document.body.removeChild(temp_elem);
    }
    if (color.indexOf('rgb') === 0)
    {
        if (color.indexOf('rgba') === -1)
            color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
        return color.match(/[\.\d]+/g).map(function (a)
        {
            return +a
        });
    }
}

var colorPicking=false;
var colorPicked=null;
function getPixelColor(x, y) {
        var canvas = document.getElementById('design');
        var ctx = canvas.getContext('2d');
        var pxData = ctx.getImageData(x,y,1,1);
        return("rgb("+pxData.data[0]+","+pxData.data[1]+","+pxData.data[2]+")");
}

function getColorUnderMouse(e){
    var canvasOffset = $("#design").offset();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;

      if(!colorPicking){return;}

      mouseX=parseInt(e.clientX-offsetX);
      mouseY=parseInt(e.clientY-offsetY);

      // Put your mousemove stuff here
      colorPicked=getPixelColor(mouseX,mouseY);

    $('#colorPickerMouseTail').css({
       left:  e.pageX+6,
       top:   e.pageY+2
    });
    $('.helper', '#colorPickerMouseTail').css("background",colorPicked);
}

/* ------------ final -------*/

function getBackgroundImageUrl($element) {
    if (!($element instanceof jQuery)) {
      $element = $($element);
    }

    var imageUrl = $element.css('background-image');
    return imageUrl.replace(/(url\(|\)|'|")/gi, '');
  }

function download(){

     if (!!uploadedFileEncoded) {
              var img = new Image;
              img.onload = function(){
              
                  var canvas = document.createElement('canvas');
                  var ctx = canvas.getContext('2d');
                  ctx.canvas.width = img.naturalWidth;
                  ctx.canvas.height = img.naturalHeight;
                  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
                  ctx.drawImage(img, 0, 0);

                  if (typeof colorRemoved !== 'undefined' && colorRemoved.length > 0) {
                          for (var i = 0; i < colorRemoved.length; i++) { 
                                removeColor(canvas,colorRemoved[i], true);  
                          } 
                  }
                  trim(canvas, true);
                
              };
              img.src = uploadedFileEncoded;
     }

}

function addBackgroundToMockup(){

    var mockup = document.createElement('canvas');
    var mockupCtx = mockup.getContext('2d');
    
    var background = new Image;
     background.onload = function(){
     
      
      var width = background.naturalWidth;
      var height = background.naturalHeight;
      
       mockupCtx.canvas.width = width;
       mockupCtx.canvas.height = height;
          
       mockupCtx.clearRect(0,0,mockupCtx.canvas.width, mockupCtx.canvas.height);
       
       
       mockupCtx.fillStyle = "#FFFFFF";
       mockupCtx.fillRect(0, 0, mockupCtx.canvas.width, mockupCtx.canvas.height);
       
       mockupCtx.drawImage(background, 0, 0);
       
       
       
      var position = [ $('#printable-area').position() , $('#max-print-size').position() , $('#design-wrapper').position()];


      var x = ( position[0].left + position[1].left + position[2].left );
      var y = ( position[0].top + position[1].top + position[2].top );

      x += 3;
      y += 3;

      mockupCtx.drawImage(dlCache, x*2, y*2); 
       
      generateDownload(mockup);
          
     };
     background.src = getBackgroundImageUrl($('#template'));

}
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';

    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

function generateDownload(mockup) {

      var selected = 0;
      var toPng = false;
      var toJpg = false;
      var toSvg = false;
      var toWebp = false;
      var toJpgQuality = 1.00;
      var toWebpQuality = 1.00;
      
      if ($('#image-format-jpg').is(':checked')) { 
        selected += 1; 
        toJpg = true; 
    
         var qualitySelectedforJpg = $('input[name=jpg-quality]:checked', "#jpg-quality-options").val();
          if (qualitySelectedforJpg == 'low') { toJpgQuality = 0.33; }
          else if (qualitySelectedforJpg == 'medium') { toJpgQuality = 0.66; }
          else if (qualitySelectedforJpg == 'high') { toJpgQuality = 1.00; }

      }
      if ($('#image-format-png').is(':checked')) { selected += 1; toPng = true; }
      if ($('#image-format-svg').is(':checked')) { selected += 1; toSvg = true; }
      if ($('#image-format-webp').is(':checked')) { 
        selected += 1; 
        toWebp = true; 
    
         var qualitySelectedforWebp = $('input[name=webp-quality]:checked', "#webp-quality-options").val();
          if (qualitySelectedforWebp == 'low') { toWebpQuality = 0.33; }
          else if (qualitySelectedforWebp == 'medium') { toWebpQuality = 0.66; }
          else if (qualitySelectedforWebp == 'high') { toWebpQuality = 1.00; }
        
      }                 
      
      if (selected == 1){
      
        if (toPng) {
              mockup.toBlob(function(blob) {
                  saveAs(blob, uploadedFileName+" - "+Math.floor(Date.now() / 1000)+".png");
              },'image/png');
        }
        else if (toSvg) {
        
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
          svg += '<image width="'+mockup.width+'" height="'+mockup.height+'" xlink:href="'+mockup.toDataURL('image/png')+'"/></svg>';

          saveAs(new Blob([svg], {type:"application/svg+xml"}), uploadedFileName+" - "+Math.floor(Date.now() / 1000)+".svg");
        }
        else if (toJpg) {
              mockup.toBlob(function(blob) {
                  saveAs(blob, uploadedFileName+" - "+Math.floor(Date.now() / 1000)+".jpg");
              },'image/jpeg', toJpgQuality); 
              console.log(toJpgQuality);       
        }
        else if (toWebp) {
              mockup.toBlob(function(blob) {
                  saveAs(blob, uploadedFileName+" - "+Math.floor(Date.now() / 1000)+".webp");
              },'image/webp', toWebpQuality);
              console.log(toWebpQuality);        
        }
      
    }
    else if (selected > 1) {
        var zip = new JSZip();
          
        if (toPng) {
              zip.file(uploadedFileName+".png", dataURLToBlob(mockup.toDataURL('image/png')), {binary: true});                  
        }
        if (toSvg) {
        
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
          svg += '<image width="'+mockup.width+'" height="'+mockup.height+'" xlink:href="'+mockup.toDataURL('image/png')+'"/></svg>';

          zip.file(uploadedFileName+".svg", new Blob([svg], {type:"application/svg+xml"}), {binary: true});
        }
        if (toJpg) {
              zip.file(uploadedFileName+".jpg", dataURLToBlob(mockup.toDataURL('image/jpeg'), toJpgQuality), {binary: true});       
        }
        if (toWebp) {
              zip.file(uploadedFileName+".webp", dataURLToBlob(mockup.toDataURL('image/webp'), toWebpQuality), {binary: true});        
        }          
          
        zip.generateAsync({type:"blob"}).then(function (blob) {
          saveAs(blob, uploadedFileName+" - "+Math.floor(Date.now() / 1000)+".zip");
        });
          

    }
    else {
      
    }

    $('#popup').popup('hide');
    $("#download-btn").css("pointer-events", "auto");
    
}