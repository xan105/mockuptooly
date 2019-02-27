/*Copyright Anthony Beaumont 
  December 2017 
*/

var fileTypeAccepted = ['jpg', 'jpeg', 'png', 'svg', 'gif'];
var uploadedFileEncoded = null;
var uploadedFileName = '';

(function($, window, document) {
   $(function() { 
/*main*/

clickEvent();
InitDrag();
InitResize();

$('#popup').popup({
        focusdelay: 400,
        outline: true,
        vertical: 'middle'
});

  /*cookieconsent.initialise({
    "palette": {
      "popup": {
        "background": "#292d34"
      },
      "button": {
        "background": "#2980b9"
      },
      "highlight": {
        "background": "#3cb0fd"
      }
    },
    "content": {
      "href": "http://help.sheepbay.com/policy/cookie.php"
    }
  });*/


/*end of main*/
  });
   
 /*
 * jQuery alterClass plugin
 * Copyright (c) 2011 Pete Boere (the-echoplex.net)
 * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
  $.fn.alterClass = function ( removals, additions ) {
    
    var self = this;
    
    if ( removals.indexOf( '*' ) === -1 ) {
      self.removeClass( removals );
      return !additions ? self : self.addClass( additions );
    }

    var patt = new RegExp( '\\s' + 
        removals.
          replace( /\*/g, '[A-Za-z0-9-_]+' ).
          split( ' ' ).
          join( '\\s|\\s' ) + 
        '\\s', 'g' );

    self.each( function ( i, it ) {
      var cn = ' ' + it.className + ' ';
      while ( patt.test( cn ) ) {
        cn = cn.replace( patt, ' ' );
      }
      it.className = $.trim( cn );
    });

    return !additions ? self : self.addClass( additions );
  };
  
  $.fn.removeClassStartingWith = function (filter) {
    $(this).removeClass(function (index, className) {
        return (className.match(new RegExp("\\S*" + filter + "\\S*", 'g')) || []).join(' ')
    });
    return this;
  };   
   
}(window.jQuery, window, document));

function InitDrag(){

$( "#max-print-size" ).draggable({ handle: "#max-print-size-move, #max-print-size-label", containment: "#printable-area", scroll: false, start: function( event, ui ) {
              $(this).removeClassStartingWith('center');},
});

var maxPrintSize = $('#max-print-size');
var designWrapper = $('#design-wrapper');
var printableArea = $('#printable-area');
var cursorPreviousPosition = { x: 0, y: 0};
var speed = 1;
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/OPR/.test(navigator.userAgent);
if (isChrome){speed = 2;}

$('#design-wrapper').draggable({
        cursor: "move",
        scroll: false,
        start: function(e, ui){
          $(this).removeClassStartingWith('center');
          draggableWidth = designWrapper.outerWidth();
          draggableHeight = designWrapper.outerHeight();
          parentWidth = Math.floor(maxPrintSize.width());
          parentHeight = Math.floor(maxPrintSize.height());
          parentOuterWidth = Math.floor(maxPrintSize.outerWidth());
          parentOuterHeight = Math.floor(maxPrintSize.outerHeight());
          offset =  maxPrintSize.position();
          boundaries = {x: Math.floor(printableArea.width()) - parentOuterWidth, y: Math.floor(printableArea.height()) - parentOuterHeight };
          innerBoundaries = {x: parentWidth - draggableWidth , y: parentHeight - draggableHeight};
          cursorPreviousPosition.x = e.clientX;
          cursorPreviousPosition.y = e.clientY; 
        },
        drag: function(e, ui){
            
           var draggable = {x: ui.position.left + draggableWidth, y: ui.position.top + draggableHeight};

           if (cursorPreviousPosition.y > e.clientY) { directionY = 'up';}
           else if (cursorPreviousPosition.y < e.clientY) { directionY = 'down';}
           else if (cursorPreviousPosition.y == e.clientY) { directionY = 'none';}
           
           if (cursorPreviousPosition.x > e.clientX) { directionX = 'left';}
           else if (cursorPreviousPosition.x < e.clientX) { directionX = 'right';}
           else if (cursorPreviousPosition.x == e.clientX) { directionX = 'none';}
           
           if (cursorPreviousPosition.y > e.clientY) { direction = 'up';}
           else if (cursorPreviousPosition.y < e.clientY) { direction = 'down';}
           else if (cursorPreviousPosition.x > e.clientX) { direction = 'left';}
           else if (cursorPreviousPosition.x < e.clientX) { direction = 'right';}
           else if (cursorPreviousPosition.x == e.clientX || cursorPreviousPosition.y == e.clientY) { direction = 'none';}
           
            if(draggable.x >= parentWidth && draggable.y >= parentHeight && directionY == 'down' && directionX == 'right' ){ //bottom right

                if (Math.round(offset.left) >= boundaries.x) { maxPrintSize.removeClassStartingWith('center').css("left", boundaries.x+"px"); } 
                else {
                  offset.left += speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                if (Math.round(offset.top) >= boundaries.y) { maxPrintSize.removeClassStartingWith('center').css("top", boundaries.y-1+"px"); } 
                else {
                  offset.top += speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }
                maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");
            }
            else if(draggable.y >= parentHeight && ui.position.left <= 0 && directionX == 'left' && directionY == 'down'){ // bottom left
            
                if (Math.round(offset.top) >= boundaries.y) { maxPrintSize.removeClassStartingWith('center').css("top", boundaries.y-1+"px"); } 
                else {
                  offset.top += speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }
                if (Math.round(offset.left) <= 0) { maxPrintSize.removeClassStartingWith('center').css("left", "0px"); } 
                else {
                  offset.left -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
            }
            else if(ui.position.top <= 0 && draggable.x >= parentWidth && directionX == 'right' && directionY == 'up'){ //top right

                if (Math.round(offset.top) <= 0) { maxPrintSize.removeClassStartingWith('center').css("top", "0px"); } 
                else {
                  offset.top -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }  
                if (Math.round(offset.left) >= boundaries.x) { maxPrintSize.removeClassStartingWith('center').css("left", boundaries.x+"px"); } 
                else {
                  offset.left += speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
            }
            else if(ui.position.top <= 0 && ui.position.left <= 0 && directionX == 'left' && directionY == 'up'){ //top left

                if (Math.round(offset.top) <= 0) { maxPrintSize.removeClassStartingWith('center').css("top", "0px"); } 
                else {
                  offset.top -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }  
                if (Math.round(offset.left) <= 0) { maxPrintSize.removeClassStartingWith('center').css("left", "0px"); } 
                else {
                  offset.left -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
            }
            else if(draggable.x >= parentWidth && direction == 'right'){ //right

                if (Math.round(offset.left) >= boundaries.x) { maxPrintSize.removeClassStartingWith('center').css("left", boundaries.x+"px"); } 
                else {
                  offset.left += speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
            }
            else if(draggable.y >= parentHeight && direction == 'down'){ // bottom
            
                if (Math.round(offset.top) >= boundaries.y) { maxPrintSize.removeClassStartingWith('center').css("top", boundaries.y-1+"px"); } 
                else {
                  offset.top += speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }
                maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");
            }
            else if(ui.position.top <= 0 && direction == 'up'){ //top

                if (Math.round(offset.top) <= 0) { maxPrintSize.removeClassStartingWith('center').css("top", "0px"); } 
                else {
                  offset.top -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
                }  
                maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");
            }
            else if(ui.position.left <= 0 && direction == 'left'){ //left

                if (Math.round(offset.left) <= 0) { maxPrintSize.removeClassStartingWith('center').css("left", "0px"); } 
                else {
                  offset.left -= speed;
                  maxPrintSize.removeClassStartingWith('center').css("left", Math.floor(offset.left)+"px");  
                }
                maxPrintSize.removeClassStartingWith('center').css("top", Math.floor(offset.top)+"px");
            }
            
            /*design-wrap containment*/  
            
            if (ui.position.top <= 0 && draggable.x >= parentWidth){ //top right
              ui.position.top = 0;
              ui.position.left = innerBoundaries.x;
            }
            else if (ui.position.top <= 0 && ui.position.left <= 0){ // top left
              ui.position.top = 0;
              ui.position.left = 0; 
            }
            else if (draggable.y >= parentHeight && ui.position.left <= 0){ // bottom left
              ui.position.top = innerBoundaries.y; 
              ui.position.left = 0; 
            }
            else if (draggable.y >= parentHeight && draggable.x >= parentWidth){ //bottom right
              ui.position.top = innerBoundaries.y;
              ui.position.left = innerBoundaries.x;
            }
            else if (draggable.x >= parentWidth){ //right
                ui.position.left = innerBoundaries.x;
            }
            else if (draggable.y >= parentHeight){ //bottom
                ui.position.top = innerBoundaries.y;  
            }
            else if (ui.position.top <= 0){ //top
                ui.position.top = 0;  
            }
            else if (ui.position.left <= 0) { //left
                ui.position.left = 0;
            }
            
            if (ui.position.left < 0 ){ ui.position.left = 0; }
            if (ui.position.top < 0 ){ ui.position.top = 0; }
            
            cursorPreviousPosition.x = e.clientX;
            cursorPreviousPosition.y = e.clientY;  
        }
});

}


function InitResize(){

var startX, startY, startWidth, startHeight;
document.getElementById('design-resize-handler').addEventListener('mousedown', initResize, false);

  function initResize(e) {
     $('#design-wrapper').draggable( 'disable' );
     $('body').css('cursor','se-resize');
     $('#design-wrapper').css('cursor','se-resize');
     startX = e.clientX;
     startY = e.clientY;
     startWidth = parseInt(document.defaultView.getComputedStyle(document.getElementById('design')).width, 10);
     startHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById('design')).height, 10);

     window.addEventListener('mousemove', Resize, false);
     window.addEventListener('mouseup', stopResize, false);
  }
  function Resize(e) {

     var oldWidth = $('#design').width();
     var oldHeight = $('#design').height();
     var width = startWidth + e.clientX - startX;
     var height = startHeight + e.clientY - startY;     
     
     var ratio = ratioCalc(oldWidth,oldHeight,width,height);

      width  = ratio*oldWidth;
      height = ratio*oldHeight;
          
      if (width == 0) { return false; }
      else if (height == 0) { return false; }
      
      if (width > $('#max-print-size').width()) { return false; }
      else if (height > $('#max-print-size').height()) { return false; }
      
      

     document.getElementById('design').style.width = width + 'px';
     document.getElementById('design').style.height = height + 'px';
     
        if ( Math.round($('#design-wrapper').position().left+$('#design-wrapper').outerWidth()) > Math.floor($('#max-print-size').outerWidth()) ) {
          document.getElementById('design').style.width = oldWidth + 'px';
          document.getElementById('design').style.height = oldHeight + 'px';
        }
        else if ( Math.round($('#design-wrapper').position().top+$('#design-wrapper').outerHeight()) > Math.floor($('#max-print-size').outerHeight()) ) {
          document.getElementById('design').style.width = oldWidth + 'px';
          document.getElementById('design').style.height = oldHeight + 'px';
        } 
  }
  function stopResize(e) {
      window.removeEventListener('mousemove', Resize, false);
      window.removeEventListener('mouseup', stopResize, false);
      $('#design-wrapper').draggable( 'enable' );
      $('body').css('cursor','auto');
      $('#design-wrapper').css('cursor','move');
  }

}


function clickEvent(){

var template = $("#template");

$('.share', "#social-button").click(function(e) {
        var width= 600;
        var height=450;

        e.preventDefault();
        window.open($(this).attr('href'), 'ShareWindow', 'height='+height+', width='+width+', top=' + ($(window).height() / 2 - (height/2)) + ', left=' + ($(window).width() / 2 - (width/2)) + ', toolbar=no, location=no, menubar=no, directories=no, scrollbars=no, resizable=yes');
        return false;
});


$('#category').on('change', function() {
  template.alterClass('cat-*', 'cat-'+this.value.toLowerCase());
  
  var subLevel = $(this).children('option:selected').data('sublevel').toLowerCase();
  template.alterClass('type-*', 'type-'+$('#'+subLevel).find('option:selected').val().toLowerCase());
  
  $('.type').hide().next('.dropdown').hide();
  $('#'+subLevel).closest(".dropdown").css("display","inline-block").prev().show();
  
  loadFile();
  
});

$('.type').next('.dropdown').find("select").on('change', function() {
  
  template.alterClass('cat-*', 'cat-'+$("#category").find('option:selected').val().toLowerCase());
  template.alterClass('type-*', 'type-'+this.value.toLowerCase());
  
  loadFile();
  
});

$('#front-back-switch').click(function() {
  if (template.hasClass("view-front")){ var value = 'Back';}
  else if (template.hasClass("view-back")){ var value = 'Front';}

  $(this).find("span").text(value);

  template.alterClass('view-*', 'view-'+value.toLowerCase());
  
  loadFile();
  
});

$('#color-wheel').click(function() {
  
  $('#color-selection').toggle();
  
});

$('.color-box', "#color-selection").click(function() {
  
    var color = $(this).data("color");
    template.alterClass('color-*', 'color-'+color.toLowerCase());
  
});

$(".range", "#sliders").on("input", function(){

  $(this).prev().find(".slider-value").text($(this).val());

});

$(".range", "#sliders").on("change", function(){ drawn(); }); 
$(".flip", "#flip-control").on("change", function(){ drawn(); });

$('#showPrintArea').change(function() {
   if($(this).is(":checked")) { 
    $('#printable-area').removeClass('no-border').addClass('border');
    return;
   }
   else {
    $('#printable-area').removeClass('border').addClass('no-border');
   }
});

$('#showMaxPrintArea').change(function() {
   if($(this).is(":checked")) { 
    $('#max-print-size').removeClass('border').addClass('force-border');
    return;
   }
   else {
    $('#max-print-size').removeClass('force-border').addClass('border');
   }
});

$("#center-both").click(function() {
  
    $('#max-print-size').prop("style").removeProperty("left");
    $('#max-print-size').alterClass( 'center-*', 'center-h' );
    $('#design-wrapper').prop("style").removeProperty("top");
    $('#design-wrapper').prop("style").removeProperty("left");
    $('#design-wrapper').alterClass( 'center-*', 'center-b' );
  
});

$("#center-h").click(function() {
  
    $('#max-print-size').prop("style").removeProperty("left");
    $('#max-print-size').alterClass( 'center-*', 'center-h' );
    $('#design-wrapper').css("top", $('#design-wrapper').position().top+"px");
    $('#design-wrapper').prop("style").removeProperty("left");
    $('#design-wrapper').alterClass( 'center-*', 'center-h' );
  
});

$("#center-v").click(function() {
  
    $('#design-wrapper').css("left", $('#design-wrapper').position().left+"px");
    $('#design-wrapper').prop("style").removeProperty("top");
    $('#design-wrapper').alterClass( 'center-*', 'center-v' );
  
});

$("#magic-eraser").click(function(){ 

  if (!colorPicking) {
    colorPicking=true; 
    $('#design-wrapper').draggable( 'disable' );
    $("#design-wrapper").addClass("colorPick");
  }
  else {
    colorPicking=false; 
    $('#design-wrapper').draggable( 'enable' );
    $("#design-wrapper").removeClass("colorPick");
  }

});

$("#design").mousemove(function(e){ getColorUnderMouse(e); });

$("#design").mouseenter(function(){ 
  if(colorPicking){
    $('#colorPickerMouseTail').show();
  }
});

$("#design").mouseleave(function(){ 
  if(colorPicking){
    $('#colorPickerMouseTail').hide();
  }
});

$("#design").click(function(){

  if(!colorPicking){return;}
  else { colorPicking=false; 
  
    removeColor(cache,colorValues(colorPicked));
    trim(cache);
    $('#colorPickerMouseTail').hide();
  }

});


$('.slide', "#side-panel").click(function() {

    that = $(this);
    animation = 300;
    
    if (that.hasClass('nowait')){ animation = 0;}
    
    that.css("pointer-events", "none");
    if (that.hasClass('active')){
      that.alterClass('active','inactive');
      that.parent().next().slideUp(animation);
    }else{
      that.alterClass('inactive','active');
      that.parent().next().slideDown(animation);
    }
    setTimeout(function() { that.css("pointer-events", "auto"); }, animation);
});

$("#side-panel-reset").click(function() {
    $("#sharpenLevel").val(10).prev().find('.slider-value').text(10);
    $("#blurLevel").val(0).prev().find('.slider-value').text(0);
    $("#brightLevel").val(100).prev().find('.slider-value').text(100);
    $("#contrastLevel").val(100).prev().find('.slider-value').text(100);
    $("#grayscaleLevel").val(0).prev().find('.slider-value').text(0);
    $("#hueLevel").val(0).prev().find('.slider-value').text(0);
    $("#invertLevel").val(0).prev().find('.slider-value').text(0);
    $("#opacityLevel").val(100).prev().find('.slider-value').text(100);
    $("#saturateLevel").val(100).prev().find('.slider-value').text(100);
    $("#sepiaLevel").val(0).prev().find('.slider-value').text(0);
    $("#flip-control input:radio[name=flip]:first").prop("checked", true);
    drawn();
});

$("#design-delete").click(function() {
    var canvas = document.getElementById('design');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.canvas.width = 0;
    ctx.canvas.height = 0;
    ctxCache.clearRect(0,0,cache.width, cache.height);
    ctxCache.canvas.width = 0;
    ctxCache.canvas.height = 0;
    uploadedFileEncoded = null;
    $("#design").prop("style").removeProperty("width");
    $("#design").prop("style").removeProperty("height");
    $(".btn:nth-child(2)","#buttons").alterClass("enable","disable");
    colorRemvoved = [];
});

$('.modal-trigger').click(function() {
  popup_display($(this).data('modal'));
});
$("#popup_close_button").click(function() { $('#popup').popup('hide'); });

$("#input-design").change(function(e){ 
  var input = document.getElementById($(this)[0].id);
  var file = input.files[0];
  loadFile(file);
  e.target.value = '';
});


$("#img-drop-zone").on('dragover', function () { $(this).addClass('hover'); return false; });
$("#img-drop-zone").on('dragend', function () { $(this).removeClass('hover'); return false; });
$("#img-drop-zone").on('dragleave', function () { $(this).removeClass('hover'); return false; });

$("#img-drop-zone").on('drop', function (e) {
  $(this).removeClass('hover');
  e.preventDefault();
  var files = e.target.files;
if (!files || files.length === 0)
    files = (e.dataTransfer ? e.dataTransfer.files : e.originalEvent.dataTransfer.files);
  loadFile(files[0]);
  return false;
});

$("#download-btn").click(function() {
  $(this).css("pointer-events", "none");
  download();
});

}

function popup_display(name){
  var popup = $('#popup_'+name);

  $('.popup', "#popup").hide();
  $('#popup_header_title').text(popup.data('title'));
  popup.show();
  $('#popup').popup('show');
}

function loadFile(file=null){

if (file) {
        var extension = file.name.split('.').pop().toLowerCase(),
        isImg = fileTypeAccepted.indexOf(extension) > -1;
        
        if (isImg) { //yes
            var reader = new FileReader();
            reader.onloadstart = function (e) {
            
              $('.notice', "#img-drop-zone").hide();
              $('.loading', "#img-drop-zone").show();
            
            }
            reader.onloadend = function (e) {
            
            uploadedFileEncoded = reader.result;
            uploadedFileName = clean(file.name);

            
            var maxWidth = parseFloat($('#max-print-size').css("width"));
            var maxHeight = parseFloat($('#max-print-size').css("height"));

              var img = new Image;
              img.onload = function(){
              
                var ratio = ratioCalc(img.naturalWidth,img.naturalHeight,maxWidth,maxHeight);
                
                if ( ratio >= 1) { 
                  $('#fileIsTooSmall').show().addClass('blink');
                  setTimeout(function() { 
                    $('#fileIsTooSmall').removeClass('blink').hide(); 
                    $('.loading', "#img-drop-zone").hide();
                    $('.notice', "#img-drop-zone").show();
                  }, 3000);
                
                }
                else { console.log(ratio); console.log("file loaded");
                
                downscale(img,ratio,trim);
                
                }
                
                
              };
              img.src = uploadedFileEncoded;

            }
            reader.readAsDataURL(file);
        }
        else { 
            $('#img-drop-zone').find('.green').addClass('blink');
            setTimeout(function() { $('#img-drop-zone').find('.green').removeClass('blink'); }, 3000);
        }
    }
    else {
        if (uploadedFileEncoded != null){

            var maxWidth = parseFloat($('#max-print-size').css("width"));
            var maxHeight = parseFloat($('#max-print-size').css("height"));

              var img = new Image;
              img.onload = function(){
                var ratio = ratioCalc(img.naturalWidth,img.naturalHeight,maxWidth,maxHeight);
                    downscale(img,ratio,trim);
              };
              img.src = uploadedFileEncoded;
              $("#template-box-overlay").show();
        }
    
    
    }
    $("#design").removeAttr("style");
    $("#design-wrapper").prop("style").removeProperty("top");
    $("#design-wrapper").prop("style").removeProperty("left");
    $("#max-print-size").prop("style").removeProperty("top");
    $("#max-print-size").prop("style").removeProperty("left");
    $("#max-print-size").alterClass("center-*","center-h");
    $("#design-wrapper").alterClass("center-*","center-b");
    $(".btn:nth-child(2)","#buttons").alterClass("enable","disable");
    colorRemvoved = [];  
        
}

function ratioCalc(width,height,targetWidth,targetHeight){

  return Math.min (targetWidth / width, targetHeight / height);

}

function clean(str) {
    str = str.toString();
    return str.replace(/<\/?[^>]+>/gi, '').replace(/\.[^/.]+$/, "");
}