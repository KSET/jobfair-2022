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
    date: new Date("04-02-2022"),
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
    date: new Date("04-02-2022"),
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
].map((obj) => ({
  ...obj,
  slug: kebabCase(obj.title),
  image: "/tmp/blog.jpg",
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
