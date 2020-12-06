import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route, useParams } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import DOMPurify from 'dompurify';

const Navbar = () => {
  return (
    <ul class={styles.u_nav}>
      <li class={styles.li_nav}><Link class={styles.li_nav_link} to="/">Home</Link></li>
      <li class={styles.li_nav}><Link class={styles.li_nav_link} to="/article/new">+ Article</Link></li>
      <li class={styles.li_nav}><Link class={styles.li_nav_link} to="/article/all">Articles</Link></li>
    </ul>
  );
}

const Home = () => {
  return (
    <div>
      <div>
        <h5>Implemented features</h5>
        <ul>
          <li>List all articles <em>(/article/all)</em></li>
          <li>Display an article <em>(/article/display/[article ID])</em></li>
          <li>Create a new article <em>(/article/new)</em></li>
          <li>Edit an existing article <em>(/article/edit/[article ID])</em></li>
        </ul>
      </div>
      <div className={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/article/new">Add an article</Link>
        <Link to="/article/all">All articles</Link>
      </div>
    </div>
  )
}

const AllArticles = () => {
  const [articles, setArticles] = useState([]);
  const contract = useSelector(({ contract }) => contract);

  useEffect(() => {
    if (contract) {
      contract.methods.getAllIds().call().then(ids => {
        ids.forEach ( i => {
          contract.methods.articleContent(i).call().then(content => {
            setArticles(articles => [...articles, content])
          });
        });
      });
    }
  }, [contract, setArticles]);

  return <div>
      {// <div className={styles.links}>
      //   <Link to="/">Home</Link>
      // </div>
    }
      <div className={styles.articleList}>
          {articles.map((article,index) => {
            return <div className={styles.articleWrapper} key={index}> Article #{index} : <Link to={"/article/edit/" + index}>Edit</Link>
        {  /* <Link to={"/article/" + index }> View </Link> */}
                <div className={styles.articleContent} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(article)}} />
            </div>}
          )}
      </div> {/* articleWrapper*/}
    </div>
}

const NewArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const [editor, setEditor] = useState(null);

  const handleSubmit = () => {
    // e.preventDefault();
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
      <input type="submit" value="Create" />
    </form>
  );
}

const DisplayArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const { id } = useParams();
  const [content, setContent] = useState(null);

  if (contract) {
    contract.methods.articleContent(id).call().then((res) => {
      if (res !== "")
        setContent(res);
      else
        setContent("<em>404 - Article " + id + " does not exist</em>");
    });
  }

  return (
    <div id="article" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize("<h5>Article #" + id + "</h5>" + content )}} />
  );
}

const EditArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const [editor, setEditor] = useState(null);
  const { id } = useParams();

  const handleSubmit = e => {
    e.preventDefault();
    if (contract) {
      contract.methods.editArticle(id, editor.getContent()).send();
    }
  };
  useEffect(() => {
    if (contract) {
      contract.methods.articleContent(id).call().then((res) => {
        const editor = new MediumEditor(`.${styles.editable}`);
        editor.setContent(res);
        setEditor(editor);
      });
    }

  }, [setEditor, contract, id]);

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.subTitle}>Edit an article</div>
      <div className={styles.mediumWrapper}>
        <textarea className={styles.editable} />
      </div>
      <input type="submit" value="Edit" />
    </form>
  );
}

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
      <Navbar />
      <h1 className={styles.title}>Welcome to Decentralized Wikipedia</h1>
      <em>Made by Quentin Piotrowski and PO Velly</em>
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
        <Route path="/article/display/:id">
          <DisplayArticle />
        </Route>
        <Route path="/article/edit/:id">
          <EditArticle />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  )
}

export default App
