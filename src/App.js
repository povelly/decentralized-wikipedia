import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'

const Home = () => {
  return (
    <div className={styles.links}>
      <Link to="/">Home</Link>
      <Link to="/article/new">Add an article</Link>
      <Link to="/article/all">All articles</Link>
    </div>
  )
}

const AllArticles = () => {
  const [articles, setArticles] = useState([]);
  const contract = useSelector(({ contract }) => contract);



  useEffect(() => {

    const art = [];

    if (contract) {
      async function f() {
      let ids=await contract.methods.getAllIds().call();

        ids.forEach(async i => {
            let content= await contract.methods.articleContent(i).call();
            art.push(content);
            //console.log("content iteration");
            //console.log("<:"+art);


            console.log(">:"+art);


        }); //end foreach

        setArticles(article => [...art]);
        console.log("c fini");




        /*
        ids.map(async i => {
            let content = await contract.methods.articleContent(i).call();
            //console.log("content iteration");
            console.log("<:"+art);
            art.push(content);
            console.log(">:"+art);
            setArticles(article => [...articles, content]);
            console.log(art);
        });
        */

      }
      f();
      }



  }, [contract, setArticles]);

  return <div>{articles.map((article, index) => {
    console.log("map iteration");
    return <div key={index}>{article}</div>;
  }
)}</div>
}

const NewArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const [editor, setEditor] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();
    if (contract) {
      contract.methods.addArticle(editor.getContent()).send();
    }
  };
  useEffect(() => {
    setEditor(new MediumEditor(`.${styles.editable}`))
  }, [setEditor]);
  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.subTitle}>New article</div>
      <div className={styles.mediumWrapper}>
        <textarea className={styles.editable} />
      </div>
      <input type="submit" value="Submit" />
    </form>
  );
}

// const EditArticle = () => {
//   return ("TODO");
// }

const NotFound = () => {
  return <div>Not found</div>
}

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(Ethereum.connect)
  }, [dispatch])
  return (
    <div className={styles.app}>
      <div className={styles.title}>Welcome to Decentralized Wikipedia</div>
      <Switch>
        <Route path="/article/new">
          <NewArticle />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/article/all">
          <AllArticles />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  )
}

export default App
