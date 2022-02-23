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
].map((obj) => ({
  ...obj,
  slug: kebabCase(obj.title),
}));

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
