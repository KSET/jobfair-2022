import {
  Arg,
  Field,
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
            <a href="https://www.versoaltima.com/">VERSO ALTIMA</a>,
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
            <a href="https://productive.io/" rel="noopener noreferrer" target="_blank">Productive</a>,
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
            <a href="https://www.versoaltima.com/">VERSO ALTIMA</a>,
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
            <a href="https://productive.io/" rel="noopener noreferrer" target="_blank">Productive</a>,
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
].map((obj) => ({
  ...obj,
  slug: kebabCase(obj.title),
}))
  .sort((a, b) => Number(b.date) - Number(a.date))
;

export class NewsMockResolver {
  @Query(() => [ News ])
  news(
    @Arg("lang") lang: string,
  ): MaybePromise<News[]> {
    return news.filter((n) => n.lang === lang);
  }

  @Query(() => News, { nullable: true })
  newsItem(
    @Arg("slug") slug: string,
  ): MaybePromise<News | null> {
    return news.find((n) => n.slug === slug) || null;
  }
}
