import {
  Arg,
  Field,
  InputType,
  Int,
  MaybePromise,
  ObjectType,
  Query,
} from "type-graphql";
import kebabCase from "lodash/fp/kebabCase";

@ObjectType()
class News {
  @Field()
    lang: string = "";

  @Field()
    date: Date = new Date();

  @Field()
    slug: string = "";

  @Field()
    title: string = "";

  @Field()
    image: string = "";

  @Field()
    description: string = "";

  @Field()
    content: string = "";
}

const news = [
  {
    lang: "hr_HR",
    date: new Date("02-04-2022"),
    image: "/tmp/blog.jpg",
    title: "Vraća li se Job Fair?",
    description: "Sigurno ti je već odavno iznošena sva zaliha majica koju čuvaš od zadnjeg Job Faira i pitaš se kada će biti prilika za obnovom ormara?",
    content: `<h1>Kada će Job Fair?</h1>
          <p>
            Nakon gotovo dvije godine čekanja, došlo je vrijeme za <strong>povratak na štandove</strong>! Tako je, ovogodišnji Job Fair u svojem veličanstvenom povratku slavi, 15. rođendan! Zato rezerviraj
            <strong>11. i 12. svibnja</strong> u svom kalendaru za dolazak na Job Fair!
          </p>

          <h1>Što možeš očekivati?</h1>
          <p>
            Prvenstveno bit će preko <strong>100 domaćih</strong> i inozemnih poduzeća koja će posjetiti Job Fair i predstaviti svoje projekte, tehnologije i znanja na kreativno uređenim <strong>štandovima</strong>,
            zanimljivim <strong>talkovima</strong>, stručnim <strong>radionicama</strong> i <strong>panel raspravama</strong>. Puno toga za posjetiti, zar ne?
          </p>
          <p>
            Osim toga, u razgovoru s predstavnicima poduzeća saznaj sve o <strong>mogućnostima obavljanja prakse i zaposlenja</strong> te se tako upoznaj s aktualnostima na tržištu rada. I nezaboravit na
            <strong>novi merch</strong> koja su ti poduzeća pripremila!
          </p>

          <h1>Koji su noviteti?</h1>
          <p>
            Ove godine želimo da ti bude ekstra edukativno i <strong>zabavno</strong>! Zato pripremamo aktivnosti u kojima ćeš u ležernoj i opuštenoj atmosferi moći upoznati poslodavce i buduće kolege. Šuška se i o
            novom sugovorniku na <strong>Hot Talku</strong> - <em>hot</em> razgovoru u kojem uz konzumaciju ljutih umaka sudionici odgovaraju na jednako vruća pitanja.
          </p>
          <p>
            Ali to nije sve - <strong>Job Fair se seli</strong>! Gdje točno? Otkrivamo uskoro!
          </p>
          <p>
            Job Fair organizira se u skladu s trenutno važećim epidemiološkim mjerama Nacionalnog stožera civilne zaštite, a sve sudionike pozivamo na odgovorno ponašanje.
          </p>
          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("02-04-2022"),
    image: "/tmp/blog.jpg",
    title: "Is Job Fair returning?",
    description: "Surely all the T-shirts you got since the last Job Fair has been worn out for a long time and you’re wondering when will there be an opportunity to restock your closet?",
    content: `<h1>When’s Job Fair?</h1>
          <p>
            After two years of waiting, it’s time to finally <strong>visit the booths</strong>! That's right, this year Job Fair is returning to celebrate its 15th birthday! So reserve
            <strong>11th & 12th May</strong> in your calendar so you can come and visit Job Fair for both days!
          </p>

          <h1>What can you expect?</h1>
          <p>
            There will be over 100 domestic and international companies that will visit Job Fair and present their projects, technologies and knowledge at creatively decorated
            <strong>booth, during their talks on the stage, at workshops or panel discussions</strong>. Lot of activities to visit, right?
          </p>
          <p>
            Find out everything you need to know about different <strong>job and career opportunities</strong> that await you on the labour market in conversations with company representatives. Also, don’t forget to
            collect their cool new merch!
          </p>

          <h1>Whats new?</h1>
          <p>
            This year we want your experience to be extra educational and <strong>extra fun</strong>! That is why we are preparing activities in which you will be able to meet employers in a relaxed atmosphere.
            Also, another <strong>Hot Talk</strong> is also rumored to be on the menu! Hot Talk is a spicy conversation in which with the participants consume hot flavored food and answer equally hot questions.
          </p>
          <p>
            But that is not all - <strong>Job Fair is moving</strong>! Wanna know where? Stay tuned and find out soon!
          </p>
          <p>
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> will be organized in accordance with the current epidemiological measures of the National Civil Protection Headquarters that will be valid during the
            time of the event.
          </p>
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },
  {
    lang: "hr_HR",
    date: new Date("02-21-2022"),
    image: "/tmp/blog2.png",
    title: "Poduzeća - prijavite se na 15. Job Fair!",
    description: "U tijeku su prijave poduzeća za petnaesti Job Fair, najveći sajam poslova u Hrvatskoj.",
    content: `<p>
            <strong>Job Fair</strong> je savršena prilika okupljanja nekoliko tisuća studenata i preko sto poduzeća. Ovaj jedinstveni događaj održat će se <strong>11. i 12. svibnja</strong> kad će predstavnici uspješnih <strong>domaćih, regionalnih i inozemnih poduzeća</strong> imati priliku studentima predstaviti svoje područje i način rada.
          </p>
          
          <p>
            Na <strong>štandovima</strong> ćete moći razgovarati sa studentima i prenijeti im informacije o <strong>otvorenim pozicijama</strong>. Kroz razgovor im otkrijte sve što ih zanima - od <strong>obaveza i zadatka</strong> koje određeno radno mjesto podrazumijeva do <strong>dodatnih prilika i pogodnosti</strong> koje različite pozicije otvaraju. Na sajmu će, uz štandove, biti organizirani <strong>talkovi, radionice</strong> te <strong>panel rasprave</strong> na kojima ćete moći predstaviti aktualne, ali i studentima zanimljive teme. 
          </p>

          <h1>Uključite se na vrijeme!</h1>
          <p>
            <strong>Prijave</strong> za poduzeća otvorene su <strong>do 2. ožujka</strong>, a prijaviti se možete putem <strong><a href="https://jobfair.fer.unizg.hr/profile/me/company/signup">internetske stranice</a> Job Faira</strong>.  Pozivamo poduzeća da na vrijeme osiguraju svoje mjesto na ovom dvodnevnom događaju koji okuplja perspektivne studente i uspješna poduzeća. <strong>Ponudu</strong> za ovogodišnji Job Fair možete zatražiti putem upita na e-adresu <u>jobfair@fer.hr</u>. 
          </p>
          <p>
            Job Fair organizira se u skladu s trenutno važećim epidemiološkim mjerama Nacionalnog stožera civilne zaštite, a sve sudionike pozivamo na odgovorno ponašanje.
          </p>
          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("02-21-2022"),
    image: "/tmp/blog2.png",
    title: "Company applications are open!",
    description: "The company's applications for the 15th Job Fair, the largest job fair in Croatia, are underway.",
    content: `<p>
            <strong>Job Fair</strong> is a perfect opportunity to gather several thousand students and over a hundred companies. This unique event will take place on <strong>May 11th and 12th</strong>, when representatives of successful <strong>domestic, regional and foreign companies</strong> will have the opportunity to present their field and way of working to students.
          </p>
          <p>
            At the <strong>booths</strong>, you will be able to talk to students and pass on information about <strong>open positions</strong>. Through conversation, you can reveal everything that interests them - from the <strong>obligations and tasks</strong> that a certain job entails to the additional opportunities and benefits that different positions open up. In addition to the booths, <strong>talks, workshops and panel discussions</strong> will be organized at the fair, where you can present current topics of interest to students.
          </p>

          <h1>Get involved on time!</h1>
          <p>
            <strong>Applications</strong> for companies are open <strong>until March 2nd</strong>, and you can apply through the <a href="https://jobfair.fer.unizg.hr/profile/me/company/signup">Job Fair website</a>. Secure your place in time at this two-day event that brings together exceptional students and successful companies. You can request an <strong>offer</strong> for this year's Job Fair by inquiring at the e-mail address: <u>jobfair@fer.hr</u>.
          </p>
          <p>
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> will be organized in accordance with the current epidemiological measures of the National Civil Protection Headquarters that will be valid during the
            time of the event.
          </p>
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },
  {
    lang: "hr_HR",
    date: new Date("03-16-2022"),
    image: "/tmp/blog3.jpg",
    title: "Gdje se to seli Job Fair?",
    description: "Dugoočekivani povratak Job Fair sajma odvest će te na novu lokaciju.",
    content: `<h1>Ostajemo u kvartu!</h1>
          <p>
            Nakon godina i godina prepunih hodnika na Fakultetu elektrotehnike i računarstva u Zagrebu, ove ćeš godine morati  prošetati do susjedne <strong>Sportske dvorane Martinovka</strong>. 
          </p>

          <h1>Tko igra utakmicu?</h1>
          <p>
            Na petnaestom Job Fairu koji će se održati <strong>11. i 12. svibnja</strong> u Sportskoj dvorani Martinovka, umjesto sportskih utakmica, moći ćeš posjetiti više od <strong>130 štandova</strong>, upoznati se s ljudima iz industrije, dobiti uvid u njihov posao i saznati što su ti zanimljivo pripremili za program na pozornici.
          </p>
          <p>
            Uz labirint <strong>štandova</strong>, paralelno na pozornici koja je u središtu Job Faira, moći ćeš poslušati <strong>talkove, panel raspravu</strong> i nasmijati se uz <strong>hot talk</strong> na kojima će ti gosti iz globalnih i hrvatskih tehnoloških poduzeća predstaviti aktualne i uzbudljive  teme iz mnogih područja IT-a i znanosti. Za <strong>radionice</strong> ćeš ipak ostati na dobro poznatom FER-u, dok će se na kraju prvog dana zabava, odnosno <strong>Loosen up party</strong> održati u KSET-u.
          </p>
  
          <p>
            Job Fair organizira se u skladu s trenutno važećim epidemiološkim mjerama Nacionalnog stožera civilne zaštite, a sve sudionike pozivamo na odgovorno ponašanje.
          </p>
          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("03-16-2022"),
    image: "/tmp/blog3.jpg",
    title: "Where is Job Fair moving?",
    description: "The long-awaited return of Job Fair will take you to a new location",
    content: `
          <h1>We’re staying in the neighborhood!</h1>
          <p>
            After years and years of crowded hallways at the Faculty of Electrical Engineering and Computing in Zagreb, you will have to take a short walk to the neighboring <strong>Sports Hall Martinovka</strong>.
          </p>

          <h1>Who plays the match?</h1>
          <p>
            At the 15th Job Fair, which will be held on <strong>May 11th and 12th</strong> in the Martinovka Sports Hall, instead of sports matches, you will be able to visit more than <strong>130 booths</strong>, meet people from the industry, get an insight into their work and learn about various other interesting things they prepared for you for the stage program.
          </p>
          <p>
            Along with the labyrinth of <strong>booths</strong>, simultaneously at the stage in the center of Job Fair, you will be able to listen to <strong>talks</strong> , <strong>panel discussion</strong> and laugh during the <strong>hot talk</strong> where guests from global and regional technology companies will present current and exciting topics from many fields of IT and science. For the <strong>workshops</strong>, you will still stay at the well-known FER, while at the end of the first day there will be a <strong>Loosen up party</strong>, held at KSET.
          </p>

          <p>
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> will be organized in accordance with the current epidemiological measures of the National Civil Protection Headquarters that will be valid during the
            time of the event.
          </p>
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },
  {
    lang: "hr_HR",
    date: new Date("04-20-2022"),
    image: "/tmp/blog4.png",
    title: "Saznaj koja poduzeća dolaze na 15. Job Fair",
    description: "Upoznaj predstavnike iz Ericsson Nikola Tesla, Amazon Web Servicesa, Gideona, Infinuma i ostalih poduzeća koja dolaze na Job Fair.",
    content: `
          <p>
          Na ovogodišnjem <strong>Job Fairu</strong>, najvećem sajmu poslova u Hrvatskoj, sudjelovat će <strong>134 poduzeća</strong> iz <strong>14 različitih industrija</strong>.
          Tijekom dva dana sajma, poslodavci će se studentima i studenticama te svima onima u potrazi za praksom i poslom moći predstaviti na štandovima te održavajući talkove i radionice. 
          </p>
          
          <p>
            <strong>Automotive</strong>:
            <a href="https://www.avl.com/?avlregion=GLOBAL&groupId=10138&lang=en_US">AVL</a>,
            <a href="https://www.logicbricks.com/">XYLON</a>,
            <a href="https://intis-engineering.com/hr/">Intis Engineering</a>,
            <a href="https://croatia.comsysto.com/">Comsysto Reply</a>,
            <a href="https://www.mireo.hr/">Mireo</a>,
            <a href="https://infinum.com/about/ventures/porsche-digital-croatia/">Porsche Digital Croatia</a>,
            <a href="https://www.cetitec.com/">CETITEC</a>,
            <a href="https://www.dspace.com/en/pub/home.cfm">dSPACE</a>,
            <a href="https://www.greyp.com/">GREYP</a>,
            <a href="https://rasco.hr/">RASCO</a>,
            <a href="https://www.vertiv.com/en-emea/">VERTIV</a>,
            <a href="https://www.rimac-technology.com/">Rimac Technology</a>
          </p>
          
          <p>
            <strong>Aviation</strong>:
            <a href="https://www.crocontrol.hr/" rel="noopener noreferrer" target="_blank">HRVATSKA KONTROLA ZRAČNE PLOVIDBE</a>
          </p>
          
          <p>
            <strong>Big Data:</strong>
            <a href="https://memgraph.com/" rel="noopener noreferrer" target="_blank">Memgraph</a>,
            <a href="https://inteligencija.com/" rel="noopener noreferrer" target="_blank">Poslovna inteligencija</a>,
            <a href="https://alfatec.hr/" rel="noopener noreferrer" target="_blank">Alfatec</a>,
            <a href="https://bonsai.tech/" rel="noopener noreferrer" target="_blank">bonsai.tech</a>,
            <a href="https://www.atma.io/" rel="noopener noreferrer" target="_blank">atma.io</a>
          </p>
          
          <p>
            <strong>Computer Vision:</strong>
            <a href="https://phishar.com/" rel="noopener noreferrer" target="_blank">PhishAR</a>,
            <a href="https://photomath.com/" rel="noopener noreferrer" target="_blank">Photomath</a>,
            <a href="https://visagetechnologies.com/" rel="noopener noreferrer" target="_blank">Visage Technologies</a>,
            <a href="https://microblink.com/" rel="noopener noreferrer" target="_blank">Microblink</a>
          </p>
          
          <p>
            <strong>Electroacoustics</strong>:
            <a href="http://www.darh2.hr/" rel="noopener noreferrer" target="_blank">DARH 2</a>
          </p>
          
          <p>
            <strong>Electronics and embedded software:</strong>
            <a href="https://altpro.com/hr/" rel="noopener noreferrer" target="_blank">ALTPRO</a>,
            <a href="https://www.framos.com/en/" rel="noopener noreferrer" target="_blank">FRAMOS</a>,
            <a href="https://spyro-soft.com/" rel="noopener noreferrer" target="_blank">Spyrosoft</a>,
            <a href="https://www.dynatrace.com/" rel="noopener noreferrer" target="_blank">Dynatrace</a>,
            <a href="https://www.infineon.com/" rel="noopener noreferrer" target="_blank">Infineon Technologies Austria</a>,
            <a href="https://www.ses-imagotag.com/" rel="noopener noreferrer" target="_blank">SES - imagotag</a>,
            <a href="https://www.byte-lab.com/" rel="noopener noreferrer" target="_blank">Byte Lab</a>,
            <a href="https://dok-ing.hr/" rel="noopener noreferrer" target="_blank">DOK-ING</a>
          </p>
          
          <p>
            <strong>Energy</strong>:
            <a href="https://www.koncar.hr/" rel="noopener noreferrer" target="_blank">KONČAR Grupa</a>,
            <a href="https://www.inetec.hr/" rel="noopener noreferrer" target="_blank">INETEC</a>,
            <a href="https://www.helb.hr/hr/" rel="noopener noreferrer" target="_blank">HELB</a>,
            <a href="https://www.hep.hr/" rel="noopener noreferrer" target="_blank">HEP GRUPA</a>,
            <a href="https://www.hops.hr/" rel="noopener noreferrer" target="_blank">HOPS</a>
          </p>
          
          <p>
            <strong>Financial</strong>:
            <a href="https://www.imc.com/eu/" rel="noopener noreferrer" target="_blank">IMC Trading</a>,
            <a href="https://www.nets.eu/" rel="noopener noreferrer" target="_blank">Nets</a>,
            <a href="https://www.pbz.hr/" rel="noopener noreferrer" target="_blank">Privredna banka Zagreb</a>,
            <a href="https://www.tis.hr/" rel="noopener noreferrer" target="_blank">TIS</a>,
            <a href="https://crosig.hr/" rel="noopener noreferrer" target="_blank">Croatia osiguranje.</a>,
            <a href="https://www.janestreet.com/" rel="noopener noreferrer" target="_blank">Jane Street Europe</a>,
            <a href="https://www.fina.hr/" rel="noopener noreferrer" target="_blank">FINA</a>,
            <a href="https://www.zaba.hr/home/" rel="noopener noreferrer" target="_blank">ZABA</a>
          </p>
          
          <p>
            <strong>Gaming</strong>:
            <a href="https://gamepires.com/" rel="noopener noreferrer" target="_blank">Gamepires</a>,
            <a href="https://www.nanobit.com/" rel="noopener noreferrer" target="_blank">NANOBIT</a>
          </p>
          
          <p>
            <strong>Geospatial and GIS</strong>:
            <a href="https://optimoroute.com/" rel="noopener noreferrer" target="_blank">OptimoRoute</a>
          </p>
          
          <p>
            <strong>Industry automation</strong>:
            <a href="https://www.gideonbros.ai/" rel="noopener noreferrer" target="_blank">Gideon</a>,
            <a href="https://www.jungheinrich.com/en" rel="noopener noreferrer" target="_blank">JUNGHEINRICH</a>,
            <a href="https://www.auc.systems/hr/" rel="noopener noreferrer" target="_blank">A&amp;C</a>,
            <a href="https://www.duplico.hr/" rel="noopener noreferrer" target="_blank">Duplico</a>,
            <a href="https://suprabit.eu/" rel="noopener noreferrer" target="_blank">Suprabit</a>,
            <a href="https://www.knapp.com/en/" rel="noopener noreferrer" target="_blank">KNAPP</a>,
            <a href="https://www.montelektro.hr/hr/" rel="noopener noreferrer" target="_blank">Montelektro</a>
          </p>
          
          <p>
            <strong>Information and communication technology</strong>:
            <a href="https://aws.amazon.com/" rel="noopener noreferrer" target="_blank">AWS - Amazon Web Services</a>,
            <a href="https://www.ericsson.hr/" rel="noopener noreferrer" target="_blank">Ericsson Nikola Tesla</a>,
            <a href="https://www.megatrend.com/" rel="noopener noreferrer" target="_blank">Megatrend poslovna rješenja</a>,
            <a href="https://www.leapbit.com/" rel="noopener noreferrer" target="_blank">Leapbit</a>,
            <a href="https://www.span.eu/hr/" rel="noopener noreferrer" target="_blank">Span</a>,
            <a href="https://mstart.hr/" rel="noopener noreferrer" target="_blank">mStart</a>,
            <a href="https://www.syntio.net/" rel="noopener noreferrer" target="_blank">Syntio</a>,
            <a href="https://www.barrage.net/" rel="noopener noreferrer" target="_blank">BARRAGE</a>,
            <a href="https://www.biss.hr/" rel="noopener noreferrer" target="_blank">BISS</a>,
            <a href="https://www.versoaltima.com/">VERSO ALTIMA</a>,
            <a href="https://productive.io/" rel="noopener noreferrer" target="_blank">Productive</a>,
            <a href="https://www.commondo.eu/" rel="noopener noreferrer" target="_blank">Commondo</a>,
            <a href="https://www.deloittedigital.com/" rel="noopener noreferrer" target="_blank">Deloitte Digital</a>,
            <a href="https://robotiq.ai/" rel="noopener noreferrer" target="_blank">Robotiq.ai</a>,
            <a href="https://www.strabag.hr/" rel="noopener noreferrer" target="_blank">STRABAG</a>,
            <a href="https://superology.com/" rel="noopener noreferrer" target="_blank">Superology</a>,
            <a href="https://www.moj-posao.net/" rel="noopener noreferrer" target="_blank">MojPosao</a>,
            <a href="https://www.true-north.hr/" rel="noopener noreferrer" target="_blank">True North</a>,
            <a href="https://www.cloudsense.com/" rel="noopener noreferrer" target="_blank">CloudSense</a>,
            <a href="https://hrprodigy.hr/" rel="noopener noreferrer" target="_blank">HR Prodigy</a>,
            <a href="https://televend.eu/" rel="noopener noreferrer" target="_blank">Televend by Intis</a>,
            <a href="https://www.laus.hr/" rel="noopener noreferrer" target="_blank">LAUS CC</a>,
            <a href="https://www.lemax.net/" rel="noopener noreferrer" target="_blank">Lemax</a>,
            <a href="https://www.mobilisis.hr/" rel="noopener noreferrer" target="_blank">MOBILISIS</a>,
            <a href="https://www.carnet.hr/" rel="noopener noreferrer" target="_blank">CARNET</a>,
            <a href="https://www.huddle.com/" rel="noopener noreferrer" target="_blank">Huddle</a>,
            <a href="https://in2.hr/" rel="noopener noreferrer" target="_blank">IN 2 grupa</a>,
            <a href="https://www.infoart.hr/" rel="noopener noreferrer" target="_blank">Infoart</a>,
            <a href="https://www.spi.hr/" rel="noopener noreferrer" target="_blank">SPI - Sustav poslovnih informacija</a>,
            <a href="https://www.spi.hr/" rel="noopener noreferrer" target="_blank">NEOS</a>,
            <a href="https://oiv.hr/hr/naslovnica/" rel="noopener noreferrer" target="_blank">OIV</a>,
            <a href="https://stype.tv/" rel="noopener noreferrer" target="_blank">STYPE</a>,
            <a href="https://www.syskit.com/" rel="noopener noreferrer" target="_blank">SysKit</a>,
            <a href="https://see.asseco.com/" rel="noopener noreferrer" target="_blank">ASEE</a>,
            <a href="https://atos.net/hr/hrvatska" rel="noopener noreferrer" target="_blank">Atos</a>,
            <a href="https://www.infodom.hr/" rel="noopener noreferrer" target="_blank">InfoDom</a>,
            <a href="https://king-ict.hr/" rel="noopener noreferrer" target="_blank">KING ICT</a>,
            <a href="https://koios.hr/hr/" rel="noopener noreferrer" target="_blank">Koios</a>,
            <a href="https://www.mediatoolkit.com/" rel="noopener noreferrer" target="_blank">Mediatoolkit</a>,
            <a href="https://chainsafe.io/" rel="noopener noreferrer" target="_blank">ChainSafe Systems</a>,
            <a href="https://www.sedamit.hr/" rel="noopener noreferrer" target="_blank">Sedam IT</a>,
            <a href="https://www.srce.unizg.hr/" rel="noopener noreferrer" target="_blank">Srce</a>,
            <a href="https://www.axilis.com/" rel="noopener noreferrer" target="_blank">Axilis</a>,
            <a href="https://realnetworks.com/" rel="noopener noreferrer" target="_blank">RealNetworks</a>,
            <a href="https://www.infobip.com/" rel="noopener noreferrer" target="_blank">Infobip</a>,
            <a href="https://five.agency/" rel="noopener noreferrer" target="_blank">FIVE</a>,
            <a href="https://www.mindsmiths.com/" rel="noopener noreferrer" target="_blank">Mindsmiths</a>
          </p>
          
          <p>
            <strong>Mobile and web development:</strong>
            <a href="https://www.trikoder.net/" rel="noopener noreferrer" target="_blank">Trikoder</a>,
            <a href="https://infinum.com/" rel="noopener noreferrer" target="_blank">Infinum</a>,
            <a href="https://www.ingemark.com/" rel="noopener noreferrer" target="_blank">Ingemark</a>,
            <a href="https://corporate.sofascore.com/" rel="noopener noreferrer" target="_blank">SofaScore</a>,
            <a href="https://arsfutura.com/" rel="noopener noreferrer" target="_blank">Ars Futura</a>,
            <a href="https://agency04.com/" rel="noopener noreferrer" target="_blank">Agency 04</a>,
            <a href="https://deegloo.com/" rel="noopener noreferrer" target="_blank">Deegloo</a>,
            <a href="https://www.b2match.com/" rel="noopener noreferrer" target="_blank">b2match</a>,
            <a href="https://www.freshbooks.com/" rel="noopener noreferrer" target="_blank">FreshBooks</a>,
            <a href="https://www.typeqast.com/" rel="noopener noreferrer" target="_blank">TYPEQAST</a>,
            <a href="https://decode.agency/" rel="noopener noreferrer" target="_blank">DECODE</a>,
            <a href="https://www.2e-systems.com/" rel="noopener noreferrer" target="_blank">2e Systems</a>,
            <a href="https://www.bornfight.com/" rel="noopener noreferrer" target="_blank">Bornfight</a>,
            <a href="https://ekobit.com/hr" rel="noopener noreferrer" target="_blank">Ekobit</a>,
            <a href="https://verybigthings.com/" rel="noopener noreferrer" target="_blank">Very Big Things</a>,
            <a href="https://minus5.hr/" rel="noopener noreferrer" target="_blank">minus 5</a>,
            <a href="https://netgen.io/" rel="noopener noreferrer" target="_blank">Netgen</a>,
            <a href="https://q.agency/" rel="noopener noreferrer" target="_blank">Q agency</a>,
            <a href="https://www.shape404.agency/" rel="noopener noreferrer" target="_blank">SHAPE</a>,
            <a href="https://croz.net/" rel="noopener noreferrer" target="_blank">CROZ</a>,
            <a href="https://undabot.com/" rel="noopener noreferrer" target="_blank">UNDABOT</a>
          </p>
          
          <p>
            <strong>Network &amp; security:</strong>
            <a href="https://www.infigo.hr/" rel="noopener noreferrer" target="_blank">INFIGO IS</a>,
            <a href="https://tbtl.com/" rel="noopener noreferrer" target="_blank">Blockhouse Technology</a>,
            <a href="https://www.conet.de/HR/conet" rel="noopener noreferrer" target="_blank">CONET Hrvatska</a>,
            <a href="https://www.cs.hr/" rel="noopener noreferrer" target="_blank">CS Computer Systems</a>,
            <a href="https://www.reversinglabs.com/" rel="noopener noreferrer" target="_blank">REVERSINGLABS</a>
          </p>
          
          <p>
            <strong>Telecommunications</strong>:
            <a href="https://www.axiros.com/" rel="noopener noreferrer" target="_blank">AXIROS</a>,
            <a href="https://maxtena.com/" rel="noopener noreferrer" target="_blank">Maxtena</a>,
            <a href="https://www.a1.hr/" rel="noopener noreferrer" target="_blank">A1 HRVATSKA</a>
          </p>
          
          <p>
            <strong>Prijave za 15. Job Fair otvaramo uskoro</strong>, što znači da je krajnje vrijeme za pisanje i poliranje životopisa!
          </p>
          
          <p>
            Prijave će biti omogućene putem naše <strong>internetske stranice</strong> gdje ćeš moći predati svoj životopis u bazu životopisa i tako primiti svoju ulaznicu, odnosno QR kod koji će ti služiti i kao posjetnica. 
          </p>
          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("04-20-2022"),
    image: "/tmp/blog4.png",
    title: "Which companies are coming to 15th Job Fair?",
    description: "Meet representatives from Ericsson Nikola Tesla, Amazon Web Services, Gideon, Infinum and other companies coming to Job Fair.",
    content: `
          <p>
            In this year’s Job Fair, <strong>134 companies</strong> from <strong>14</strong> different <strong>industries</strong> will take part at the largest job fair in Croatia. During the two days of the fair, company representatives will be able to present themselves to thousand of students looking for jobs or internships. They will also hold different talks, workshops and participate in the panel discussion or Hot talk. 
          </p>
          
          <p>
            <strong>Automotive</strong>:
            <a href="https://www.avl.com/?avlregion=GLOBAL&groupId=10138&lang=en_US">AVL</a>,
            <a href="https://www.logicbricks.com/">XYLON</a>,
            <a href="https://intis-engineering.com/hr/">Intis Engineering</a>,
            <a href="https://croatia.comsysto.com/">Comsysto Reply</a>,
            <a href="https://www.mireo.hr/">Mireo</a>,
            <a href="https://infinum.com/about/ventures/porsche-digital-croatia/">Porsche Digital Croatia</a>,
            <a href="https://www.cetitec.com/">CETITEC</a>,
            <a href="https://www.dspace.com/en/pub/home.cfm">dSPACE</a>,
            <a href="https://www.greyp.com/">GREYP</a>,
            <a href="https://rasco.hr/">RASCO</a>,
            <a href="https://www.vertiv.com/en-emea/">VERTIV</a>,
            <a href="https://www.rimac-technology.com/">Rimac Technology</a>
          </p>
          
          <p>
            <strong>Aviation</strong>:
            <a href="https://www.crocontrol.hr/" rel="noopener noreferrer" target="_blank">HRVATSKA KONTROLA ZRAČNE PLOVIDBE</a>
          </p>
          
          <p>
            <strong>Big Data:</strong>
            <a href="https://memgraph.com/" rel="noopener noreferrer" target="_blank">Memgraph</a>,
            <a href="https://inteligencija.com/" rel="noopener noreferrer" target="_blank">Poslovna inteligencija</a>,
            <a href="https://alfatec.hr/" rel="noopener noreferrer" target="_blank">Alfatec</a>,
            <a href="https://bonsai.tech/" rel="noopener noreferrer" target="_blank">bonsai.tech</a>,
            <a href="https://www.atma.io/" rel="noopener noreferrer" target="_blank">atma.io</a>
          </p>
          
          <p>
            <strong>Computer Vision:</strong>
            <a href="https://phishar.com/" rel="noopener noreferrer" target="_blank">PhishAR</a>,
            <a href="https://photomath.com/" rel="noopener noreferrer" target="_blank">Photomath</a>,
            <a href="https://visagetechnologies.com/" rel="noopener noreferrer" target="_blank">Visage Technologies</a>,
            <a href="https://microblink.com/" rel="noopener noreferrer" target="_blank">Microblink</a>
          </p>
          
          <p>
            <strong>Electroacoustics</strong>:
            <a href="http://www.darh2.hr/" rel="noopener noreferrer" target="_blank">DARH 2</a>
          </p>
          
          <p>
            <strong>Electronics and embedded software:</strong>
            <a href="https://altpro.com/hr/" rel="noopener noreferrer" target="_blank">ALTPRO</a>,
            <a href="https://www.framos.com/en/" rel="noopener noreferrer" target="_blank">FRAMOS</a>,
            <a href="https://spyro-soft.com/" rel="noopener noreferrer" target="_blank">Spyrosoft</a>,
            <a href="https://www.dynatrace.com/" rel="noopener noreferrer" target="_blank">Dynatrace</a>,
            <a href="https://www.infineon.com/" rel="noopener noreferrer" target="_blank">Infineon Technologies Austria</a>,
            <a href="https://www.ses-imagotag.com/" rel="noopener noreferrer" target="_blank">SES - imagotag</a>,
            <a href="https://www.byte-lab.com/" rel="noopener noreferrer" target="_blank">Byte Lab</a>,
            <a href="https://dok-ing.hr/" rel="noopener noreferrer" target="_blank">DOK-ING</a>
          </p>
          
          <p>
            <strong>Energy</strong>:
            <a href="https://www.koncar.hr/" rel="noopener noreferrer" target="_blank">KONČAR Grupa</a>,
            <a href="https://www.inetec.hr/" rel="noopener noreferrer" target="_blank">INETEC</a>,
            <a href="https://www.helb.hr/hr/" rel="noopener noreferrer" target="_blank">HELB</a>,
            <a href="https://www.hep.hr/" rel="noopener noreferrer" target="_blank">HEP GRUPA</a>,
            <a href="https://www.hops.hr/" rel="noopener noreferrer" target="_blank">HOPS</a>
          </p>
          
          <p>
            <strong>Financial</strong>:
            <a href="https://www.imc.com/eu/" rel="noopener noreferrer" target="_blank">IMC Trading</a>,
            <a href="https://www.nets.eu/" rel="noopener noreferrer" target="_blank">Nets</a>,
            <a href="https://www.pbz.hr/" rel="noopener noreferrer" target="_blank">Privredna banka Zagreb</a>,
            <a href="https://www.tis.hr/" rel="noopener noreferrer" target="_blank">TIS</a>,
            <a href="https://crosig.hr/" rel="noopener noreferrer" target="_blank">Croatia osiguranje.</a>,
            <a href="https://www.janestreet.com/" rel="noopener noreferrer" target="_blank">Jane Street Europe</a>,
            <a href="https://www.fina.hr/" rel="noopener noreferrer" target="_blank">FINA</a>,
            <a href="https://www.zaba.hr/home/" rel="noopener noreferrer" target="_blank">ZABA</a>
          </p>
          
          <p>
            <strong>Gaming</strong>:
            <a href="https://gamepires.com/" rel="noopener noreferrer" target="_blank">Gamepires</a>,
            <a href="https://www.nanobit.com/" rel="noopener noreferrer" target="_blank">NANOBIT</a>
          </p>
          
          <p>
            <strong>Geospatial and GIS</strong>:
            <a href="https://optimoroute.com/" rel="noopener noreferrer" target="_blank">OptimoRoute</a>
          </p>
          
          <p>
            <strong>Industry automation</strong>:
            <a href="https://www.gideonbros.ai/" rel="noopener noreferrer" target="_blank">Gideon</a>,
            <a href="https://www.jungheinrich.com/en" rel="noopener noreferrer" target="_blank">JUNGHEINRICH</a>,
            <a href="https://www.auc.systems/hr/" rel="noopener noreferrer" target="_blank">A&amp;C</a>,
            <a href="https://www.duplico.hr/" rel="noopener noreferrer" target="_blank">Duplico</a>,
            <a href="https://suprabit.eu/" rel="noopener noreferrer" target="_blank">Suprabit</a>,
            <a href="https://www.knapp.com/en/" rel="noopener noreferrer" target="_blank">KNAPP</a>,
            <a href="https://www.montelektro.hr/hr/" rel="noopener noreferrer" target="_blank">Montelektro</a>
          </p>
          
          <p>
            <strong>Information and communication technology</strong>:
            <a href="https://aws.amazon.com/" rel="noopener noreferrer" target="_blank">AWS - Amazon Web Services</a>,
            <a href="https://www.ericsson.hr/" rel="noopener noreferrer" target="_blank">Ericsson Nikola Tesla</a>,
            <a href="https://www.megatrend.com/" rel="noopener noreferrer" target="_blank">Megatrend poslovna rješenja</a>,
            <a href="https://www.leapbit.com/" rel="noopener noreferrer" target="_blank">Leapbit</a>,
            <a href="https://www.span.eu/hr/" rel="noopener noreferrer" target="_blank">Span</a>,
            <a href="https://mstart.hr/" rel="noopener noreferrer" target="_blank">mStart</a>,
            <a href="https://www.syntio.net/" rel="noopener noreferrer" target="_blank">Syntio</a>,
            <a href="https://www.barrage.net/" rel="noopener noreferrer" target="_blank">BARRAGE</a>,
            <a href="https://www.biss.hr/" rel="noopener noreferrer" target="_blank">BISS</a>,
            <a href="https://www.versoaltima.com/">VERSO ALTIMA</a>,
            <a href="https://productive.io/" rel="noopener noreferrer" target="_blank">Productive</a>,
            <a href="https://www.commondo.eu/" rel="noopener noreferrer" target="_blank">Commondo</a>,
            <a href="https://www.deloittedigital.com/" rel="noopener noreferrer" target="_blank">Deloitte Digital</a>,
            <a href="https://robotiq.ai/" rel="noopener noreferrer" target="_blank">Robotiq.ai</a>,
            <a href="https://www.strabag.hr/" rel="noopener noreferrer" target="_blank">STRABAG</a>,
            <a href="https://superology.com/" rel="noopener noreferrer" target="_blank">Superology</a>,
            <a href="https://www.moj-posao.net/" rel="noopener noreferrer" target="_blank">MojPosao</a>,
            <a href="https://www.true-north.hr/" rel="noopener noreferrer" target="_blank">True North</a>,
            <a href="https://www.cloudsense.com/" rel="noopener noreferrer" target="_blank">CloudSense</a>,
            <a href="https://hrprodigy.hr/" rel="noopener noreferrer" target="_blank">HR Prodigy</a>,
            <a href="https://televend.eu/" rel="noopener noreferrer" target="_blank">Televend by Intis</a>,
            <a href="https://www.laus.hr/" rel="noopener noreferrer" target="_blank">LAUS CC</a>,
            <a href="https://www.lemax.net/" rel="noopener noreferrer" target="_blank">Lemax</a>,
            <a href="https://www.mobilisis.hr/" rel="noopener noreferrer" target="_blank">MOBILISIS</a>,
            <a href="https://www.carnet.hr/" rel="noopener noreferrer" target="_blank">CARNET</a>,
            <a href="https://www.huddle.com/" rel="noopener noreferrer" target="_blank">Huddle</a>,
            <a href="https://in2.hr/" rel="noopener noreferrer" target="_blank">IN 2 grupa</a>,
            <a href="https://www.infoart.hr/" rel="noopener noreferrer" target="_blank">Infoart</a>,
            <a href="https://www.spi.hr/" rel="noopener noreferrer" target="_blank">SPI - Sustav poslovnih informacija</a>,
            <a href="https://www.spi.hr/" rel="noopener noreferrer" target="_blank">NEOS</a>,
            <a href="https://oiv.hr/hr/naslovnica/" rel="noopener noreferrer" target="_blank">OIV</a>,
            <a href="https://stype.tv/" rel="noopener noreferrer" target="_blank">STYPE</a>,
            <a href="https://www.syskit.com/" rel="noopener noreferrer" target="_blank">SysKit</a>,
            <a href="https://see.asseco.com/" rel="noopener noreferrer" target="_blank">ASEE</a>,
            <a href="https://atos.net/hr/hrvatska" rel="noopener noreferrer" target="_blank">Atos</a>,
            <a href="https://www.infodom.hr/" rel="noopener noreferrer" target="_blank">InfoDom</a>,
            <a href="https://king-ict.hr/" rel="noopener noreferrer" target="_blank">KING ICT</a>,
            <a href="https://koios.hr/hr/" rel="noopener noreferrer" target="_blank">Koios</a>,
            <a href="https://www.mediatoolkit.com/" rel="noopener noreferrer" target="_blank">Mediatoolkit</a>,
            <a href="https://chainsafe.io/" rel="noopener noreferrer" target="_blank">ChainSafe Systems</a>,
            <a href="https://www.sedamit.hr/" rel="noopener noreferrer" target="_blank">Sedam IT</a>,
            <a href="https://www.srce.unizg.hr/" rel="noopener noreferrer" target="_blank">Srce</a>,
            <a href="https://www.axilis.com/" rel="noopener noreferrer" target="_blank">Axilis</a>,
            <a href="https://realnetworks.com/" rel="noopener noreferrer" target="_blank">RealNetworks</a>,
            <a href="https://www.infobip.com/" rel="noopener noreferrer" target="_blank">Infobip</a>,
            <a href="https://five.agency/" rel="noopener noreferrer" target="_blank">FIVE</a>,
            <a href="https://www.mindsmiths.com/" rel="noopener noreferrer" target="_blank">Mindsmiths</a>
          </p>
          
          <p>
            <strong>Mobile and web development:</strong>
            <a href="https://www.trikoder.net/" rel="noopener noreferrer" target="_blank">Trikoder</a>,
            <a href="https://infinum.com/" rel="noopener noreferrer" target="_blank">Infinum</a>,
            <a href="https://www.ingemark.com/" rel="noopener noreferrer" target="_blank">Ingemark</a>,
            <a href="https://corporate.sofascore.com/" rel="noopener noreferrer" target="_blank">SofaScore</a>,
            <a href="https://arsfutura.com/" rel="noopener noreferrer" target="_blank">Ars Futura</a>,
            <a href="https://agency04.com/" rel="noopener noreferrer" target="_blank">Agency 04</a>,
            <a href="https://deegloo.com/" rel="noopener noreferrer" target="_blank">Deegloo</a>,
            <a href="https://www.b2match.com/" rel="noopener noreferrer" target="_blank">b2match</a>,
            <a href="https://www.freshbooks.com/" rel="noopener noreferrer" target="_blank">FreshBooks</a>,
            <a href="https://www.typeqast.com/" rel="noopener noreferrer" target="_blank">TYPEQAST</a>,
            <a href="https://decode.agency/" rel="noopener noreferrer" target="_blank">DECODE</a>,
            <a href="https://www.2e-systems.com/" rel="noopener noreferrer" target="_blank">2e Systems</a>,
            <a href="https://www.bornfight.com/" rel="noopener noreferrer" target="_blank">Bornfight</a>,
            <a href="https://ekobit.com/hr" rel="noopener noreferrer" target="_blank">Ekobit</a>,
            <a href="https://verybigthings.com/" rel="noopener noreferrer" target="_blank">Very Big Things</a>,
            <a href="https://minus5.hr/" rel="noopener noreferrer" target="_blank">minus 5</a>,
            <a href="https://netgen.io/" rel="noopener noreferrer" target="_blank">Netgen</a>,
            <a href="https://q.agency/" rel="noopener noreferrer" target="_blank">Q agency</a>,
            <a href="https://www.shape404.agency/" rel="noopener noreferrer" target="_blank">SHAPE</a>,
            <a href="https://croz.net/" rel="noopener noreferrer" target="_blank">CROZ</a>,
            <a href="https://undabot.com/" rel="noopener noreferrer" target="_blank">UNDABOT</a>
          </p>
          
          <p>
            <strong>Network &amp; security:</strong>
            <a href="https://www.infigo.hr/" rel="noopener noreferrer" target="_blank">INFIGO IS</a>,
            <a href="https://tbtl.com/" rel="noopener noreferrer" target="_blank">Blockhouse Technology</a>,
            <a href="https://www.conet.de/HR/conet" rel="noopener noreferrer" target="_blank">CONET Hrvatska</a>,
            <a href="https://www.cs.hr/" rel="noopener noreferrer" target="_blank">CS Computer Systems</a>,
            <a href="https://www.reversinglabs.com/" rel="noopener noreferrer" target="_blank">REVERSINGLABS</a>
          </p>
          
          <p>
            <strong>Telecommunications</strong>:
            <a href="https://www.axiros.com/" rel="noopener noreferrer" target="_blank">AXIROS</a>,
            <a href="https://maxtena.com/" rel="noopener noreferrer" target="_blank">Maxtena</a>,
            <a href="https://www.a1.hr/" rel="noopener noreferrer" target="_blank">A1 HRVATSKA</a>
          </p>
          
          <p>
            <strong>Applications</strong> for the 15th Job Fair <strong>are opening soon</strong>, which means it’s high time to write and polish your resume!
          </p>
          
          <p>
            When applications start on our <strong>website</strong>, there you will be able to submit your resume to the resume database and thus receive your entry ticket in a form of a QR code that will also serve as a digital business card. Company representatives will be able to scan it and save your resume in their <em>Favorites</em> tab so they can find it easier in the database after the fair.
          </p>
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },
  {
    lang: "hr_HR",
    date: new Date("05-04-2022"),
    image: "/tmp/blog5.png",
    title: "Poznat raspored za 15. Job Fair!",
    description: "Posjetitelje 15. Job Faira unutar dva dana očekuje 134 poduzeća, 24 talkova, 16 radionica, panel rasprava i Hot talk.",
    content: `
          <p>
            Sajam poslova Job Fair uspješno nastavlja svoju tradiciju kao žarišna točka sastajališta vrhunskih studenata i najzanimljivijih domaćih te inozemnih tehnoloških poduzeća.
            Ove godine, uz štandove, <strong>11. i 12. svibnja na pozornici u SD Martinovka</strong> predstavnici poduzeća će održati 25 talkova na kojima će zainteresiranim studentima predstavit svoje projekte,
            tehnologije i znanja stečena kroz dugogodišnji rad u različitim industrijama. Istovremeno na Fakultetu elektrotehnike i računarstva će se održati 16 radionica. 
          </p>
          
          <h1>Prvi dan obilježit će umrežavanje i zabava</h1>
          
          <p>
            Prvi dan 15. Job Faira će započeti u 10 sati u dvoranama A201, A301 te u Bijeloj vijećnici na FER-u s poduzećima TrueNorth, Agency04 i dSPACEom koja će održati svoje radionice. Paralelno u SD Martinovka program započinje u 1o sati gdje će nas dočekati talkovi poduzeća: Ericsson Nikola Tesla, Syntio, Memgraph, Končar, Srce, RealNetworks te panel rasprava, s početkom u 13 sati, na temu kako AI utječe na naše društvo.
          </p>
          
          <p>
            Stručnjaci iz Gideona, OptimoRoutea, RealNetworksa i studentica FER-a Lucija Arambašić će odgovoriti na pitanja: zašto nam je život lakši uz umjetnu inteligenciju, koje su loše strane masovne primjene umjetne inteligencije te ima li razloga za brigu.
          </p>
          
          <p>
            Nakon panel rasprave uslijedit će talkovi Ingenmarka, A1, Trikodera, Microblinka, DECODE-a te Infobipa. Dan ćemo zaokružiti u neformalnom okruženju na Loosen Up Partiju u KSET-u uz razne zabavne igre i besplatne koktele.
          </p>
          
          <h1>Drugi dan začinit će se ljutim razgovorima</h1>
          
          <p>
            Drugi dan započinjemo u 10 sati s radionicama koje će voditi predstavnici poduzeća Končar i Comsysto Replya u Bijeloj vijećnici i u SPOCK-u na FER-u. Istovremeno, u SD Martinovka će započeti prvi blok talkova gdje nas očekuju mStart, INETEC, Gideon, Arsfutura, Poslovna inteligencija i FIVE.
          </p>
          
          <p>
            U 13 sati započinje Hot Talk, neformalni intervju uz vruća pitanja i još ljuće umake. U pohod na titulu prvaka Hot Talka na pozornicu će stupiti <strong>Luka Drezga, Chief Operating Officer Ars Future</strong>.
          </p>
          
          <p>
            U trenutku dok će se Luka znojiti na pozornici, na FER-u će se održavati drugi blok radionica koje uključuju ByteLab i Undabot. Nakon Hot Talka, program u SD Martinovka ćemo nastaviti s nizom talkova koje će održati predstavnici iz Xylona, Spana, Deglooa, minus5, Photomatha te Rimac Automobila. 
          </p>
          
          <p>
            Dan ćemo zatvoriti s radionicama koje će se održati u A201 dvorani, SPOCK-u te u Bijeloj vijećnici na FER-u, a održat će ih predstavnici iz poduzeća Televend by Intis, Arsfutura i Ericsson Nikola Tesla. 
          </p>
          
          <p>
            Svi zaineresirani za sudjelovanje trebaju se prijaviti na Job Fair <a href="/profile/me/cv">ispunjavanjem baze životopisa</a> i tako rezervirati svoje mjesto.
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("05-04-2022"),
    image: "/tmp/blog5.png",
    title: "Schedule for the 15th Job Fair finally released!",
    description: "Visitors of the 15th Job Fair can expect 134 companies, 24 talks, 16 workshops, a panel talk and a Hot talk during two days of the Fair.",
    content: `
          <p>
            The Job Fair successfully continues its tradition as a meeting hotspot for top students and the most interesting local and foreign tech companies. This year, in addition to booths, the Fair will host 25 talks on the 11th and 12th of May on the main stage at Matrinovka Sports Hall where company representatives will present projects, new technologies and knowledge gathered through years of experience in different industries to interested students. At the same time, 16 workshops will take place in the classrooms of the Faculty of Electrical Engineering and Computing (FER).
          </p>
          
          <h1>Networking and fun mark the first day</h1>

          <p>
            The first day of the Job Fair starts at 10.00 in A201, A301 and the White Hall (Bijela vijećnica) at the Faculty of Electrical Engineering and Computing with workshops by TrueNorth, Agency04 and dSPACE.
          </p>
          
          <p>
            At the same time, at 10.00, the program at Martinovka Sports Hall starts with talks by: Ericsson Nikola Tesla, Syntio, Memgraph, Končar, Srce, RealNetworks and a panel talk at 13.00 about how AI is impacting society.
          </p>
          
          <p>
            Experts from Gideon, OptimoRoute and RealNetworks, and Lucija Arambašić, student at FER, will answer questions such as why life is easier with AI , what the bad sides of mass-application AI are and if there are reasons to worry. 
          </p>
          
          <p>
            After the panel talk, talks by Ingemark, A1, Trikoder, Microblink, DECODE and Infobip will ensue. 
          </p>
          
          <p>
            The day will come to an end on an informal note with the Loosen Up Party at KSET with loads of fun games and free cocktails.
          </p>
          
          <h1>Hot talks for a spicy second day</h1>
          
          <p>
            The second day begins at 10.00 with workshops by Končar and Comsysto Reply in the White Hall (Bijela vijećnica) and SPOCK and FER. At the same time, the first block of talks at Martinovka Sport Hall starts with mStart, INETEC, Gideon, Ars Futura, Poslovna inteligencija and FIVE. 
          </p>
          
          <p>
            The Hot Talk, an informal interview with spicy questions and even spicier sauces, starts at 13. Rushing for the crown of the Hot Talk, <strong>Luka Drezga, Chief Operating Officer at Ars Futura</strong> will take the stage. 
          </p>
          
          <p>
            While Luka is sweating on the stage, the second block of talks by ByteLab and Undabot will take place at FER.
          </p>
          
          <p>
            After the Hot Talk, the program at Martinovka Sports Hall continues with a series of talks by Xylon, Span, Degloo, minus5, Photomath and Rimac Automobili.
          </p>
          
          <p>
            Thuday finishes off with workshops by Televend by Intis, Ars Futura and Ericsson Nikola Tesla in A201, SPOCK and the White Hall (Bijela vijećnica) at FER.
          </p>
          
          <p>
            People interested in participating should apply to Job Fair by <a href="/profile/me/cv">filling out the participation form CV</a> and thus reserving their place.
          </p>
          
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-05-2022"),
    image: "/tmp/blog6.png",
    title: "Prijave studenata za 15. Job Fair su otvorene!",
    description: "Ispuni bazu životopisa i upoznaj se s predstavnicima preko 130 različitih poduzeća!",
    content: `
          <p>
            Prijave za 15. Job Fair službeno su otvorene! Osiguraj svoj ulaz u SD Martinovka gdje će od <strong>11. do 12. svibnja 2022.</strong> godine cirkulirati
            preko <strong>130 tehnoloških poduzeća</strong>. Upoznaj njihove predstavnike u opuštenoj atmosferi na <strong>štandovima</strong>, poslušaj njihove <strong><em>talkove</em></strong>
            i <strong>panel raspravu</strong> koji se odvijajaju na pozornici u sredini Martinovke, posjeti njihove <strong>radionice</strong> na FER-u i zabavi se nakon prvog dana na
            <strong>Loosen Up</strong> partyju u KSET-u. Uz sve to, prijava je vrlo jednostavna i potrebno je samo <strong>par klikova</strong>.
          </p>
          
          <h3>Kako se prijaviti?</h3>
          
          <p>
            Prijavi se putem <a href="/login">internetske stranice</a> Job Faira. <strong>Registriraj se</strong> i predaj svoj <strong>životopis</strong>.
            Tada će se na <a href="/profile/me">tvojem profilu</a> pojaviti <strong>QR kod</strong> koji će ti služiti kao <strong>ulaznica</strong>.
            Prilikom dolaska na Job Fair, trebat ćeš pokazati svoj važeći QR kod koji će skenirati volonteri na ulazu u <strong>Martinovku</strong>,
            ili učionicu na <strong>FER-u</strong>. Taj isti QR kod će ti poslužiti i kao <strong>posjetnica</strong> jer će ga moći skenirati i predstavnici
            poduzeća koje upoznaš na štandovima. Tako će te jednostavnije pronaći u bazi među svim životopisima čime ćeš se <strong>više istaknuti</strong>
            od ostalih studenata koji posjete sajam.
          </p>
          
          <h3>Zašto se prijaviti?</h3>
          
          <p>
            Osim kao ulaznica na događaj, predajom svojeg životopisa u bazu, on će nakon sajma postati vidljiv i dostupan <strong>svim poduzećima</strong> koja sudjeluju
            na Job Fairu zbog čega ćeš bez obzira na upoznavanje uživo ili ne, možda dobiti poziv na <strong>razgovor za praksu ili posao</strong>.
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("05-05-2022"),
    image: "/tmp/blog6.png",
    title: "Student applications for the 15th Job Fair are now open!",
    description: "Fill out the CV form and meet representatives from over 130 different companies!",
    content: `
          <p>
            Applications for the 15th Job Fair are officially open! Secure your entry to SD Martinovka where over <strong>130 tech companies</strong> will present
            on <strong>May 11th and 12th</strong>. Meet their representatives in a relaxed environment at company <strong>booths</strong>, listen to their <strong>talks</strong>
            and <strong>the panel talk</strong> which take place on the stage in the centre of Martinovka Sports Hall, visit their workshops at FER and have fun after
            the first day at the <strong>Loosen Up Party</strong> at KSET. Besides that, the application process is straight-forward and you only need <strong>a couple of clicks</strong>.
          </p>
          
          <h3>How to apply?</h3>
          
          <p>
            Apply via the Job Fair website. <strong>Register</strong> with your <strong>CV</strong>. <a href="/profile/me">Your profile</a> will then show a <strong>QR code</strong>
            which serves as an entry ticket. You will have to show your valid QR code upon arrival to <strong>Martinovka</strong> or <strong>classrooms at FER</strong> where
            volunteers will scan it. The same QR code serves as a <strong>business card</strong> because company representatives you meet at the booths can also scan it.
            It’s an easier way to find you in the CV database which makes you <strong>stand out</strong> from the crowd of visitors.
          </p>
          
          <h3>Why apply?</h3>
          
          <p>
            In addition to being an entry ticket, by submitting your CV to the database, it becomes visible to all the companies participating in the Job Fair which is why you may
            get a <strong>job or internship offering</strong> regardless of whether you met them live or not.
          </p>
          
          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-07-2022"),
    image: "/tmp/blog7.jpg",
    title: "Luka Drezga iz Ars Future odvažio se na Hot Talk na 15. Job Fairu!",
    description: "Saznaj tko je ovogodišnji sudionik Hot Talka te hoće li oboriti prošlogodišnji rekord!",
    content: `
          <h3>Što je <em>Hot Talk</em>?</h3>

          <p>
            Drugi dan, <strong>12. svibnja</strong>, program u <strong>SD Martinovka</strong> začinit ćemo ljutim razgovorom! U <strong>13 sati</strong> ponovno će se održati
            <strong><em>Hot Talk</em></strong> - neformalni oblik <strong>intervjua</strong> u kojem, uz postavljanje pitanja iz formalne i neformalne sfere života, sudionici
            konzumiraju <strong>ljute umake</strong> koje nam je omogućio prijatelj sajma, <strong>Volim ljuto</strong>. Prije nego sudionik <em>Hot Talka</em> odgovori na pitanje,
            konzumira jedan ljuti umak koji predstavlja <strong>razinu zanimljivosti</strong> tog pitanja. Cilj je izdržati do kraja intervjua, skupiti bodove i oboriti rekord
            našeg zadnjeg <strong>prvaka</strong> ljutih razgovora - <strong>Tomislava Cara iz Infinuma</strong>.
          </p>

          <h3>Od egzistencijalne krize do ljutih umaka</h3>

          <p>
            Ovogodišnji sudionik drugog Hot Talka jest <strong>Luka Drezga</strong>, COO (Chief Operating Officer) iz <strong>Ars Future</strong>. Nakon 7 godina studiranja
            i par egzistencijalnih kriza, Luka je nakon posla ušao prvo u marketinške vode koje su ga doplovile do dizajna proizvoda, nakon čega je napokon završio u IT-u.
          </p>

          <h3>Kako je u Ars Futuri?</h3>

          <p>
            <strong>Ars Futura</strong> je agencija za softver dizajn i razvoj. Iz Zagreba su, a trenutno s njima radi oko <strong>50 opuštenih, mladih</strong> i marljivih ljudi
            (koji su većinom Dalmatinci).  Podijeljeni su u nekoliko <strong>multi-disciplinarnih timova</strong> koji rade na dugoročnim projektima svih veličina, za klijente
            s pretežno Američkog tržišta.
          </p>

          <h3>Prijavi se i dobro zabavi!</h3>

          <p>
            <strong><a href="/register">Prijavi se</a></strong> na 15. Job Fair u samo 3 koraka koristeći svoj životopis i osiguraj si ulaz na najveći regionalni sajam poslova.
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("05-07-2022"),
    image: "/tmp/blog7.jpg",
    title: "Luka Drezga from Ars Futura dared to participate in the Hot Talk at the 15th Job Fair!",
    description: "Find out who this year’s Hot Talk interviewee is and if he will break last year’s record!",
    content: `
          <h3>What is the <em>Hot Talk</em>?</h3>

          <p>
            We will spice up the programme at <strong>Martinovka Sports Hall</strong> on the second day, <strong>May 12th</strong>, with a spicy conversation!
            At <strong>13.00</strong> the <strong><em>Hot Talk</em></strong> will take place - an informal interview where, in addition to asking questions about
            the formal and informal parts of life, participants try <strong>hot sauces</strong> provided by the Fair’s partner, <strong>Volim ljuto</strong>.
            Before a participant answers the question, they try a hot sauce which matches <strong>how interesting</strong> they find the question. The goal is
            to manage to finish the interview, collect points and break the record of the Champion of our last Hot Talk - <strong>Tomislav Car from Infinum</strong>.
          </p>

          <h3>From existential crisis to hot sauces</h3>

          <p>
            This year’s participant in the second edition of the Hot Talk is <strong>Luka Drezga</strong>, COO (Chief Operating Officer) at <strong>Ars Futura</strong>.
            After 7 years of studying and a couple of existential crises, Luka dived into marketing, which landed him at product design, so he could finally find himself in IT.
          </p>

          <h3>What is it like at Ars Futura?</h3>

          <p>
            <strong>Ars Futura</strong> is a software design and development agency. They are from Zagreb and currently employ around <strong>50 young, easy-going</strong>
            and hard-working people (who are mostly from Dalmatia). They are divided into <strong>multi-disciplinary teams</strong> which work on long-term projects
            of different durations for, for the most part, American clients.
          </p>

          <h3>Apply and have fun!</h3>

          <p>
            <strong><a href="/register">Apply</a></strong> to the 15th Job Fair in just 3 easy steps using your CV and secure your place at the biggest job fair in the region.
          </p>

          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-08-2022"),
    image: "/tmp/blog8.jpg",
    title: "Otkrij koje se radionice održavaju na 15. Job Fairu!",
    description: "Čak 16 poduzeća je ove godine za tebe pripremilo zanimljive radionice na kojima možeš sudjelovati na Fakultetu elektrotehnike i računarstva.",
    content: `
          <p>
            Za vrijeme trajanja Job Faira, <strong>11. i 12. 5. od 10 do 18 sati na Fakultetu elektrotehnike i računarstva</strong> paralelno se održavaju
            po 3 zanimljive radionice. Prijavi se za sudjelovanje i u 90 minuta praktičnog rada saznaj kako problemske izazove današnjice rješavaju stručnjaci iz industrije.
          </p>

          <h3>U srijedu fokus je na automobilima i sigurnosti</h3>

          <p>
            <strong>U 10 sati, True North</strong> otkriva "Vodič za autostopere kroz DevOps" koji predstavlja praktičan pregled kroz DevOps prakse, principe,
            tehnologije i cloud nativni razvoj. <strong>dSPACE</strong> će odgovoriti na pitanje: "Kako ubrzati razvoj automobila korištenjem dSPACE simulacijskih alata?"
            i pojasniti kako simuliraju testne sustave za vozilo s motorom s unutarnjim sagorijevanjem i s električnim motorom. <strong>AG04</strong> će te uvesti
            u priču Kubernetesa uz njihov "Kubernetes Crash Course".
          </p>

          <p>
            <strong>U 13 sati</strong>, kod <strong>Greyp</strong>a svrati i "Osmisli anti-theft system za e-bicikle pomoću Design Thinkinga". Također, možeš izgraditi
            aplikaciju s <strong>CROZ</strong>-om tijekom "Dođoh, vidjeh, programirah" ili uz <strong>Alfatec</strong> saznati proces "Od podataka do znanja korištenjem
            strojnog učenja i poslovne analitike".
          </p>

          <p>
            <strong>U 16 sati</strong>, saznaj kako <strong>CARNET</strong> održava svoju visoku razinu kvalitete uz "CARNET mreža i kibernetička sigurnost".
            Upoznaj sa se mikroservisnim sustavima uz ekipu iz <strong>Sedam IT</strong>-a i "Put od baze do ekrana u mikroservisnoj arhitekturi" ili kod
            <strong>Rimac Technology</strong> otkrij "Zašto je test hardvera važan i izvan automobilske industrije?".
          </p>

          <h3>Četvrtak obilježava fina elektronika</h3>

          <p>
            <strong>Od 10 sati Končar</strong> će pokazivati "Multifunkcionalni numerički zaštitni relej generacije KONPRO 2", dok će se kod <strong>Comsysto Reply</strong>a
            moći upoznati s alatom "Terraform - upoznajte najpopularniji alat za Infrastrukturu kao Kod".
          </p>

          <p>
            <strong>Od 13 sati Byte Lab</strong> dijeli tajne za "Dizajn proizvoda tijekom nestašice čipova" npr. kako dizjanirati uređaje koji su dugoročno otporni na ovakve krize
            i sl. U isto vrijeme <strong>Undabot</strong> tijekom "Pošto kila aplikacije?" dijeli smjernice o analizi i procjeni inženjerskog posla odnosno spojnici biznisa,
            prodaje i tehnologije.
          </p>

          <p>
            <strong>Od 16 sati Ars Futura</strong> pokazivat će kako možeš koristiti javno dostupne informacije preko tzv. API-ja na primjeru  “React Crypto Trackera”.
            Također, <strong>Ericsson Nikola Tesla</strong> pokazat će "Full stack izrada aplikacije". Osim njih i <strong>Televend by INTIS</strong>  nudi svoju vrstu zanimacije:
            "Hack&Snack - Programiranje IoT proizvoda". Imat ćeš priliku i za programiranje pomoću Televend IoT uređaj kojim ćeš "hackirati" mašinu za snack.
          </p>

          <h3>Kako se možeš prijaviti na radionicu?</h3>

          <p>
            Ako već nisi, prijavi se na našoj <a href="/">internetskoj stranici</a></strong>, predaj svoj životopis u bazu životopisa kako bi se na tvom profilu stvorio gumb za prijavu na radionice.
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-09-2022"),
    image: "/tmp/blog9.jpg",
    title: "Panel rasprava o umjetnoj inteligenciji na 15. Job Fairu!",
    description: "Saznaj kako umjetna inteligencija utječe na četiri različite industrije te kakva su predviđanja stručnjaka za njezinu budućnost.",
    content: `
          <p>
            U srijedu, <strong>11. svibnja, od 13 do 14 sati</strong> na pozornici u <strong>SD Martinovka</strong> održat će se panel rasprava na temu
            umjetne inteligencije, Panel raspravu moderirat će Matej Štefanac, student FER-a, a panelisti koji sudjeluju u raspravi će obuhvatiti četiri
            različite industrije: Tomislav Haus iz <strong>Gideon</strong>a, Marin Šarić iz <strong>OptimoRoute</strong>a, Igor Mijić iz
            <strong>RealNetworks</strong>a te Lucija Arambašić s <strong>FER</strong>-a,
          </p>

          <p>U razgovoru s Matejem, otkrivamo pozadinu iza ideje za panel raspravu:</p>

          <p>
            <em>
              “U svijetu smo prepunom procesa i informacija. Prosječnu osobu svakodnevno okružuje gomila podataka i konstantna potreba za donošenjem
              raznih odluka koje mogu biti različitih važnosti: od odabira namirnica za ručak do velikih ulaganja. Također, svijet nam se prividno sve
              više “smanjuje” jer je promet postao efikasniji no ikada u ljudskoj povijesti. Saveznik i podrška svim navedenim scenarijima jest umjetna inteligencija.
              Ona nam olakšava sve te procese i štedi naše dragocijeno vrijeme. Što je umjetna inteligencija i u kojem se granama znanosti primjenjuje?
              Kako su inženjeri oblikovali današnju stvarnost uz njenu pomoć? Što nas očekuje u budućnosti?
              Odgovore na ova pitanja potražit ćemo u ovoj panel raspravi.”
            </em>
          </p>

          <p>
            Uistinu, čeka nas jedna zanimljiva panel rasprava koju svakako nećete htjeti propustiti! No, svakako se prethodno dolasku u Martinovku prijavi u bazu životopisa.
          </p>

          <h3>Prije panela - registracija!</h3>

          <p>
            Ako već nisi, prijavi se na našoj internetskoj stranici, predaj svoj životopis u bazu životopisa te pripremi <strong>QR kod</strong> s kojim možeš ući na panel raspravu.
            Prije ili nakon panela slobodno posjeti štandove poduzeća čiji predstavnici sudjeluju na panel raspravi. Također, slobodno iskoristi svoj QR kod kao <strong>posjetnicu</strong>
            jer svaki skenirani životopis će poduzeću biti posebno označen čime ćeš se dodatno istaknuti među ostalim studentima unutar baze životopisa!
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("05-09-2022"),
    image: "/tmp/blog9.jpg",
    title: "The Panel discussion about artificial intelligence at the 15th Job Fair!",
    description: "Find out how AI affects four different industries and what experts predict about its future.",
    content: `
          <p>
            On Wednesday, <strong>May 11th, from 13.00 to 14.00</strong> the stage at <strong>Martinovka Sports Hall</strong> will host a panel discussion about AI.
            The discussion will be moderated by Matej Štefanac, a student at FER, and the panelists participating in the discussion will cover four different industries:
            Tomislav Haus from <strong>Gideon</strong>, Marin Šarić from <strong>OptimoRoute</strong>, Igor Mijić from <strong>RealNetworks</strong>
            and Lucija Arambašić at <strong>FER</strong>.
          </p>

          <p>During a conversation with Matej, we found out the idea behind the panel discussion:</p>

          <p>
            <em>
              “We are currently living in a world overflowing with processes and information. The average person is constantly surrounded by heaps of data
              and the constant need to make different decisions which vary in importance: from choosing which groceries to buy to big investments.
              Furthermore, the world is seemingly “shrinking” because traffic has become more efficient than ever in human history.
              Our ally and support system in these scenarios is artificial intelligence. It makes all of these processes easies to handle and thus saves us precious time.
              What is artificial intelligence and what fields of science is it applied to? How have engineers shaped the present with its help? What can we expect of the future?
              We will find answers to all of these questions in this panel discussion.”
            </em>
          </p>

          <p>
            Indeed, we have an interesting panel discussion ahead of us, and you certainly don’t want to miss it!
            But, before arriving at Martinovka and attending, apply for entrance through the CV database.
          </p>

          <h3>Before the panel talk - registration!</h3>

          <p>
            If you haven’t already, apply through out website, submit your CV and get the <strong>QR code</strong> which allows you entrance to the panel discussion.
            Before or after the panel talk, feel free to visit booths of the companies whos representatives are participating in the discussion.
            Also, use your QR code as a business card because every CV the companies scan themselves will have a special mark which makes you
            stand out more among all the students in the database!
          </p>

          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-11-2022"),
    image: "/tmp/blog10.png",
    title: "Razvežimo kravate na 15. Job Fairu!",
    description: "Na kraju prvog dana Job Faira očekuje te mnogo zabavnih sadržaja i igara u koje se možeš uključiti!",
    content: `
          <p>
            U srijedu, <strong>11. svibnja, od 18 sati</strong> u KSET-u održat će se <strong>Loosen Up Party</strong>.
            Osim besplatnih brendiranih koktela i piva koje su nam ove godine omogućila čak <strong>23</strong> poduzeća,
            održavat će se i zabavne igre u kojima mogu sudjelovati timovi sastavljeni od predstavnika poduzeća i studenata.
            Ulaz je besplatan je i otvoren za sve!
          </p>

          <h3>Koje se igre igraju?</h3>

          <p>
            Tko još nije čuo za Igru života? Prvi dio igre obilježavaju discipline iz pop kulture: Pogodi jezik pjesme, Nastavi pjesmu
            i Pogađanje poznatih rečenica iz filmova. Ako ti prethodne discipline nisu donijele slavu, za dodatne bodove u drugom dijelu
            možeš propjevati uz karaoke i pokazati fleksibilnost uz limbo. U ovom koraku se dobro potrudi jer se u slučaju izjednačenja igramo
            Paklenih jezikolomki uz malu pomoć Volim ljuto.
          </p>

          <h3>Što je u ponudi pića?</h3>

          <p>
            Ove godine, uz 14 koktela, u ponudi je i 9 piva iz asortimana pivovare Medvedgrad.
          </p>

          <p>Kokteli:</p>

          <p>
            Memory Leak (Televend by Intis)
            TAKE THE LEAP (Leapbit)
            Blue Vision (Visage Technologies)
            The brown stuff (Syntio)
            Very Big Cocktail (Very Big Things)
            Pour Request (Infinum)
            mStart (mStart)
            Big Smash (Infobip)
            Real Booze (RealNetworks)
            #NeverDrinkingAgain (Rimac Technology)
            KONČAR’s Cocktail (KONČAR)
            Undashot (Undabot)
          </p>

          <p>Piva:</p>

          <p>
            Random šuma (OptimoRoute)
            AxBeer (Axiros)
            PivCO (Croatia osiguranje)
            MaxWave (Maxtena)
            Computer Juice (2e Systems)
            IDBEER (Infodom)
            King’s Beer (KING ICT)
            Koios (Koios)
            HR Prodigy (HR Prodigy)
          </p>

          <p>
            Za detaljnu koktel i piva kartu posjeti Loosen Up Party. Vidimo se!
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <strong><a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a></strong> stranici i prati
            nas na <strong><a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a></strong>. Također, pretplati se na naš
            <strong><a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a></strong> kanal gdje možeš pratiti Job Fair od doma, ali i vidjeti kako nam je bilo prošle godine! Job Fair
            organiziraju <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a></strong> (SS FER) i
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a></strong> (KSET).
          </p>`,
  },
  {
    lang: "en_US",
    date: new Date("05-11-2022"),
    image: "/tmp/blog10.png",
    title: "Let’s untie our ties at the 15th Job Fair!",
    description: "You’ll be able to join lots of fun activities and games at the end of the first day of Job Fair!",
    content: `
          <p>
            The Loosen Up Party will be held at KSET on Wednesday, May 11, at 6 pm. In addition to free branded cocktails
            and beers provided to us by as many as <strong>23</strong> companies this year, there will also be fun games
            in which teams made up of company representatives and students can participate. Admission is free and open to all!
          </p>

          <h3>Which games will be played?</h3>

          <p>
            Who here hasn’t heard of the Game of Life? The first part consists of pop-culture disciplines: Guess the song's language,
            Continue the song and Guess which movie the quote is from. If these games don't do you justice, you can let yourself be
            heard in karaoke or show of your flexibility in limbo for extra points. You better try hard here because in case of a tie,
            we start the game of Fiery Tongue Twisters with a little twist provided by Volim Ljuto.
          </p>

          <h3>What’s the drinks offer like?</h3>

          <p>
            This year, in addition to 14 cocktails, we also offer 9 beers from the Medvedgrad brewery assortment.
          </p>

          <p>Cocktails:</p>

          <p>
            Memory Leak (Televend by Intis)
            TAKE THE LEAP (Leapbit)
            Blue Vision (Visage Technologies)
            The brown stuff (Syntio)
            Very Big Cocktail (Very Big Things)
            Pour Request (Infinum)
            mStart (mStart)
            Big Smash (Infobip)
            Real Booze (RealNetworks)
            #NeverDrinkingAgain (Rimac Technology)
            KONČAR’s Cocktail (KONČAR)
            Undashot (Undabot)
          </p>

          <p>Beers:</p>

          <p>
            Random forest (OptimoRoute)
            AxBeer (Axiros)
            PivCO (Croatia osiguranje)
            MaxWave (Maxtena)
            Computer Juice (2e Systems)
            IDBEER (Infodom)
            King’s Beer (KING ICT)
            Koios (Koios)
            HR Prodigy (HR Prodigy)
          </p>

          <p>
            For a detailed cocktail and beer card, visit the Loosen Up Party. See ya!
          </p>

          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("05-22-2022"),
    image: "/tmp/blog11.jpg",
    title: "Kako je Job Fair proslavio svoj 15. rođendan?",
    description: "Iza nas je 15. po redu Job Fair. Najveći sajam poslova u Hrvatskoj ponovno je oborio svoje rekorde.",
    content: `
          <p>
            U srijedu i četvrtak, <strong>11. i 12. svibnja</strong>, održali smo 15. Job Fair. Sportsku dvoranu Martinovka
            na ta dva dana pretvorili smo u mjesto za upoznavanje <strong>134 poduzeća</strong> iz <strong>15 različitih industrija</strong>
            i preko <strong>5 tisuća studenata</strong> STEM usmjerenja.
          </p>

          <h3>Martinovka puna iznenađenja</h3>

          <p>
            Tijekom dva dana sajma čekalo je <strong>129 štandova</strong> da ih posjetiš, a veliki dio njih imao je i svoje dodatne aktivnosti
            sa zanimljivim nagradama. Na pozornici su u isto vrijeme predstavnici poduzeća razgovarali su o svojim iskustvima tijekom
            <strong>24 talka</strong> u nove <strong>tri kategorije</strong>: <em>Career Switch</em>, <em>What the Tech?!</em> i
            <em>Recycled Technology</em>. Osim toga, prvi dan se održala i panel rasprava na temu “Kako umjetna inteligencija utječe na naše društvo?”
            u kojoj su predstavnici iz gospodarske i akademske zajednice otkrili kako je umjetna inteligencija nastala, kako je oni primjenjuju
            u industrijama u kojima rade, koji su njeni benefit i koja su predviđanja za njen budući razvoj. Drugi dan je umjesto panel rasprave održan
            <strong>Hot talk</strong> u kojem je sudjelovao <strong>Luka Drezga, COO iz Ars Future</strong>. Odgovarajući na pitanja iz službene i neslužbene
            sfere života, pritom probavajući jednako ljute umake, svoju pobjedu odnio je ponosno osvajanjem najvećeg broja bodova do sada.
          </p>

          <h3>Nezaobilazan je bio i FER</h3>

          <p>
            Na <strong>Fakultetu elektrotehnike i računarstva</strong> se održalo čak <strong>16 radionica</strong> koje je ukupno posjetilo
            preko <strong>300 studenata</strong>. Tako su se sudionici mogli dotaknuti praktičnih zadataka i zajedničkim snagama riješiti
            jedan problem, ali i čuti razna iskustva ljudi iz industrije te kako su ih upravo oni riješili.
          </p>

          <h3>U KSET-u tradiocionalna zabava</h3>

          <p>
            Na kraju prvog dana put je vodio na <strong>Loosen up partij</strong> u <strong>Klubu studenata elektrotehnike</strong>.
            Večernje druženje odvilo se uz natjecanje u raznim igrama koje su zahtjevale poznavanja stranih jezika, filmova i glazbe,
            ali i fizičke spreme. Studenti su mogli tako u ležernijem okruženju upoznati kolege iz njima zanimljivog poduzeća koji su
            ih častili sa čak 14 vrsta besplatnih koktela i 9 vrsta točenih piva.
          </p>

          <h3>Znaimljive statistike</h3>

          <p>
            Događaj je prenijelo 20 različitih medijskih kuća, a podržalo 4 prijatelja sajma. Tijekom pripreme sajma se razmjenilo preko
            20 tisuća Slack poruka. Na sajmu je okinuto 10 366 fotografija.
          </p>

          <h3>Prijave bez kraja!</h3>

          <p>
            Od sada se možeš registrirati na <a href="https://jobfair.fer.unizg.hr/register" rel="noopener noreferrer" target="_blank">službenoj stranici</a> tijekom cijele godine i pripremiti svoj životopis za idući Job Fair!
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a> stranici te nas na <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a> i <a href="https://www.linkedin.com/company/jobfairfer/" rel="noopener noreferrer" target="_blank">LinkedInu</a>. Također, pretplati se na naš <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a> kanal gdje možeš vidjeti kako nam je bilo ove i prošlih godina! Job Fair organiziraju <a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a>, <a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a>, <a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a> (SS FER) i <a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a> (KSET).
          </p>
`,
  },
  {
    lang: "en_US",
    date: new Date("05-22-2022"),
    image: "/tmp/blog11.jpg",
    title: "How did the Job Fair celebrate its 15th birthday??",
    description: "The 15th Job Fair is now behind us. The largest job Fair in Croatia managed to break records once again.",
    content: `
          <p>
            The 15th Job Fair took place on Wednesday and Thursday, May 11 and 12. During those two days, we transformed
            Martinovka Sports Hall into a meeting spot for <strong>134 companies</strong> from 15 different industries
            and over <strong>5 thousand STEM students</strong>.
          </p>

          <h3>Martinovka full of surprises</h3>

          <p>
            129 booths waited for you to visit them, and a big part had their own activities with interesting prizes.
            At the same time company representatives held <strong>24 talks</strong> on the stage, divided into three
            categories: <em>Career Switch</em>, <em>What the Tech?!</em>, and <em>Recycled Technology</em>.
            Besides that, the first day also had the <strong>panel discussion</strong> about “How does AI impact our society?”
            in which representatives from the economy and academic community found out how AI came to be,
            how it’s used in their industries, the benefits and what predictions for its future development are.
            Instead of the panel discussion, the second day’s program was divided by the <strong>Hot Talk</strong>
            in which <strong>Luka Drezga, COO at Ars Futura</strong> participated. While answering questions from
            the work and home parts of life and trying equally spicy hot sauces, he managed to leave victorious with the highest score.
          </p>

          <h3>You couldn’t leave without visiting FER</h3>

          <p>
            <strong>16 workshops</strong> took place at the <strong>Faculty of Electrical Engineering and Computing</strong>
            with over <strong>300 visitors</strong>. Participants could together try solving practical problems and hear about
            the experience of people from the industry and how they managed to solve those same problems.
          </p>

          <h3>The traditional party at KSET</h3>

          <p>
            At the end of the first day, the <strong>Club of Students of Electrical Engineering (KSET)</strong> hosted the
            <strong>Loosen up Party</strong>. The evening’s party was enhanced with different games which required knowledge of
            foreign languages, films and music, but also fitness. Students were able to meet their colleagues from interesting
            companies in a more casual setting while companies treated them to 14 different cocktails and 9 types of beer.
          </p>

          <h3>Interesting stats</h3>

          <p>
            20 different media companies reported on the event, and 4 partners of the Fair helped.
            During the organization, over 20 thousand Slack messages were sent and during the Fair,
            10366 photos were taken.
          </p>

          <h3>Signups without an end in sight!</h3>

          <p>
            From now on you can register on the official web page all year long, and you can prepare
            your CV for next year's Job Fair!
          </p>

          <p>
            Follow the <a href="https://jobfair.fer.unizg.hr/">Job Fair official website</a>, <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook page</a>,
            <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagram profile</a> and
            <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube channel</a> for more information.
            <a href="https://jobfair.fer.unizg.hr/">Job Fair</a> is organized by
            <strong><a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a></strong>,
            <strong><a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">FER Career Center</a></strong>,
            <strong><a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">FER Student Association (SS FER)</a></strong> and the
            <strong><a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Club of Students of Electrical Engineering (KSET)</a></strong>.
          </p>`,
  },


  {
    lang: "hr_HR",
    date: new Date("08-25-2022"),
    image: "/tmp/blog12.png",
    title: "Luka Drezga o 15. Job Fairu: Ostavlja li Hot Talk ljuti okus?",
    description: "Kakvi su dojmovi nakon 15. Job Faira i 3. Hot Talka u kojem je sudjelovao, kroz intervju nam otkriva Luka Drezga iz Ars Future.",
    content: `
          <p>
            U srijedu i četvrtak, <strong>11. i 12. svibnja</strong>, održali smo <strong>15. Job Fair</strong>. Sportsku dvoranu Martinovka
            smo na ta dva dana pretvorili u mjesto za upoznavanje <strong>134 poduzeća</strong> iz <strong>15 različitih industrija</strong>
            i preko <strong>5 tisuće studenata</strong> STEM usmjerenja.
          </p>

          <p>
            Među poduzećima koja su se ove godine predstavljala na Job Fairu našla se i Ars Futura čiji se COO (Chief Operating Officer), Luka Drezga, odlučio uključiti u treći po redu Hot Talk. Luka je odnio titulu novog Hot Talkera s najviše do sada stečenih bodova pa smo ga odlučili pitati kako mu je bilo na 15. Job Fairu.
          </p>

          <h3>Sada kada su se slegli dojmovi s Job Faira, opiši nam malo kako ti je bilo na sajmu i naravno, na Hot talku?</h3>

          <p>
            Vatreno 🔥😁! Šalu na stranu, ne znam jel’ bilo do mene i konzumacije opasnih količina Volim Ljuto rukotvorina ili do prostora, ali i temperatura i atmosfera je bila uzavrela. Svaka čast i pohvale organizatorima Job Faira, ali i svim tvrtkama koje su sudjelovale. Siguran sam da nije bilo lako organizirati event s ovoliko sudionika, s obje strane.
          </p>

          <p>
            <em>Hvala ti Luka, drago nam je čuti da si se zabavio. Vatreno je bilo i nama, ali samo u dobrom smislu!</em>
          </p>

          <p>
            U nastavku slijede pitanja koja je medijska kuća VIDI odabrala, a koja su pristigla u sklopu Natječaja za najkreativnije pitanje koje još od 2020. godine VIDI nagrađuje tehnološkim nagradama. Pa krenimo!
          </p>

          <h3>Znajući što sad radiš i čime se baviš, koji bi savjet dodijelio sebi prije 5 godina?</h3>

          <p>
            You do you bby — ok je da ne znaš što sa sobom i u kojem se smjeru razvijaš i ok je tražit’ se u životu koliko god ti trebalo da se nađeš. Mislim da je u današnjim vremenima to dobar savjet svim mladim ljudima koji su pod konstantnim pritiskom da nakon završene osnovne škole moraju znati svoj životni put. Znam, zvuči malo klišejasto, ali to je tako. Brini se o sebi i da si zadovoljan sam sa sobom. Kad si tu ok, ostale se stvari nekako slože. Ne postoji jedinstveno mjerilo uspjeha, nekome je to raditi visoko plaćeni posao, nekome je to ustati se iz kreveta. Sve su to pobjede u svojoj suštini, tako da — you do you bby.
          </p>

          <h3>Misliš li da se u marketinškim odjelima IT firmi bolje snalaze ljudi baš iz tog područja ili FER-ovci koji se ipak odluče na marketing i slične pozicije?</h3>

          <p>
            Nikako ne mislim da FER-ovci imaju prednost u snalaženju u marketingu unutar IT-a. Danas dobar dio mladih ljudi ima odlične predispozicije za biti uspješan “marketingaš” u IT-u, razumiju se u tehnologiju, koriste i prate web i mobilne aplikacije i razne tehnološkei digitalne brendove. Mislim da za uspjeh u marketingu, osoba mora prvo imati “žicu” za to, a onda tek moći razumjeti za koga radi marketing. Bitno je upoznati brend na kojem radiš i ekosustav u kojem se on nalazi, nakon toga nije bitno uopće dolaziš li s tehničkog fakulteta ili nekog drugog.
          </p>

          <h3>Koja su tri savjeta koja bi rekao FER-ovcu koji želi postati UI/UX dizajner?</h3>

          <p>
            Biti FER-ovac inherentno znači biti dobar <em>problem solver</em>, bilo to u matematici, fizici ili <em>product developmentu</em> i dizajnu. Svaka aplikacija koju dizajniraš ili kodiraš, rješava neki problem i za to ćeš dobiti super podlogu na FER-u. Prvi savjet koji bi dao je da se priključiš u lokalnu zajednicu. Živimo u krasnim vremenima kada su ti sve potrebne informacije udaljene par klikova. Istraži lokalne grupe i okupljanja i sudjeluj, pričaj s ljudima i skupljaj njihova iskustva, iz toga ćeš najviše naučiti. Drugi savjet je — stvaraj. Nema veze radiš li na nekom stvarnom projektu ili sam sebi zadaješ zadatke. Uzmi neku postojeću aplikaciju i napravi svoj verziju, dizajniraj aplikaciju za rezervaciju termina kod frizera ljubimaca, uzmi neki <em>UI challenge</em> i pokušaj ga riješiti, bitno je samo da stvaraš. Na ovaj način, jednom kad kreneš u potragu za poslom i radom u nekoj IT firmi, dolaziš spreman i bogatog portfolia, a to najviše mi kao poslodavci volimo vidjeti. Zadnji savjet koji bi dao je —<em> imitation is the best form of flattery</em>. Zapamtio sam to s jednog predavanja menadžmenta u inženjerstvu, prije nego pristupiš rješavanju nekog problema pogledaj kako su to veliki igrači riješili i vidi možeš li iz njihovog pristupa izvući nešto što će pomoći tebi.
          </p>

          <h3>Ako bi se mogao baviti bilo kojim poslom iz bilo koje videoigrice, koji bi to posao bio?</h3>

          <p>
            Uf, koje lagano pitanje, isto kao i u stvarnom životu, barmen u nekoj RPG krčmi koji igraču uz čašu žestice daje neku pomoć za misiju koju trenutno prolazi, ali i koji topli, životni savjet. Ako se ikad dogodi krah IT-a, možete me potražiti iza šanka u nekoj konobi kako laštim krigle piva.
          </p>

          <h3>Za kraj, reci nam zašto misliš da je važno da studenti sudjeluju na Job Fairu, a zašto je to također važno i za poslodavce?</h3>

          <p>
            Studenti preko Job Faira danas mogu lako saznati apsolutno sve što ih zanima o budućem poslodavcu, mogu doći do štanda i jedan na jedan porazgovarati s ljudima i postaviti detaljna pitanja o poslovanju i projektima jedne IT firme. Nakon toga dobiju super sliku o zajednici i puno im je lakše odlučiti koje je poslovno okruženje najbolje za njih. Poslodavci, u drugu ruku, dobiju super priliku predstaviti se svojim budućim kolegama i umrežiti se sa zajednicom!
          </p>

          <p>
            <em>Super Luka, hvala ti još jednom što si odvojio vrijeme i razgovarao s nama o Job Fairu. Drago nam je da ti je iskustvo bilo vrlo pozitivno. Također, nadamo se da će to i druga tehnološka poduzeća i studenti prepoznati te nam se priključiti iduće godine. Što drugo reći nego: vidimo se dogodine!</em>
          </p>

          <h3>Prijave bez kraja!</h3>

          <p>
            Od sada se možeš registrirati na <a href="https://jobfair.fer.unizg.hr/register" rel="noopener noreferrer" target="_blank">službenoj stranici</a> tijekom cijele godine i pripremiti svoj životopis za idući Job Fair!
          </p>

          <p>
            Za više informacija čitaj naš blog na internetskoj stranici, lajkaj nas na našoj <a href="https://www.facebook.com/JobFair.FER/" rel="noopener noreferrer" target="_blank">Facebook</a> stranici te nas na <a href="https://www.instagram.com/jobfairfer/?hl=en" rel="noopener noreferrer" target="_blank">Instagramu</a> i <a href="https://www.linkedin.com/company/jobfairfer/" rel="noopener noreferrer" target="_blank">LinkedInu</a>. Također, pretplati se na naš <a href="https://www.youtube.com/c/JobFairFER" rel="noopener noreferrer" target="_blank">YouTube</a> kanal gdje možeš vidjeti kako nam je bilo ove i prošlih godina! Job Fair organiziraju <a href="https://www.fer.unizg.hr/" rel="noopener noreferrer" target="_blank">FER</a>, <a href="https://karijere.fer.hr/en/" rel="noopener noreferrer" target="_blank">Centar karijera FER-a</a>, <a href="http://www.ssfer.hr/index.html" rel="noopener noreferrer" target="_blank">Savez studenata FER-a</a> (SS FER) i <a href="https://www.kset.org/" rel="noopener noreferrer" target="_blank">Klub studenata elektrotehnike</a> (KSET).
          </p>
`,
  },
].map((obj) => ({
  ...obj,
  slug: kebabCase(obj.title),
}))
  .sort((a, b) => Number(b.date) - Number(a.date))
;

@InputType()
class NewsFilter {
  @Field(() => Int, { nullable: true })
    take: number = 0;
}

export class NewsMockResolver {
  @Query(() => [ News ])
  news(
    @Arg("lang") lang: string,
      @Arg("filter", { nullable: true }) filter?: NewsFilter,
  ): MaybePromise<News[]> {
    const baseNews = news.filter((n) => n.lang === lang);
    const lastNNews = baseNews.slice(0, filter?.take || baseNews.length);

    return lastNNews;
  }

  @Query(() => News, { nullable: true })
  newsItem(
    @Arg("slug") slug: string,
  ): MaybePromise<News | null> {
    return news.find((n) => n.slug === slug) || null;
  }
}
