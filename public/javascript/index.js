// 1. 현재 시간(Locale)
const curr = new Date();
// document.writeln("현재시간(Locale) : " + curr + '<br>');

// 2. UTC 시간 계산
const utc = 
      curr.getTime() + 
      (curr.getTimezoneOffset() * 60 * 1000);

// 3. UTC to KST (UTC + 9시간)
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = 
      new Date(utc + (KR_TIME_DIFF));

// document.writeln("한국시간 : " + kr_curr);

tinymce.init({
      selector: "#content",

      plugins:
            "powerpaste casechange searchreplace autolink directionality advcode visualblocks visualchars image link media mediaembed codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker editimage help formatpainter permanentpen charmap linkchecker emoticons advtable export autosave",

      menubar: false,

      toolbar:
            "undo redo formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify lineheight | removeformat",

      height: "400px",

      //Font Text Area Style
      font_css:
      '@import url("https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap");',
      font_family_formats:
            "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Open Sans=open sans,sans-serif; Roboto=roboto,regular,sans-serif;",

      //Color Text Area Style
      color_cols: 6,
      color_map: [
            "#F0F8FF",
            "aliceblue",
            "#FAEBD7",
            "antiquewhite",
            "#F0FFFF",
            "azure",
            "#FFEBCD",
            "blanchedalmond",
            "#DEB887",
            "burlywood",
            "#7FFF00",
            "chartreuse",
            "#DC143C",
            "crimson"
      ],

      //Alignment and Layout for Text Area Style
      block_formats: "Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3; Code=code"
      });