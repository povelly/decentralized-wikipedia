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
    <ul className={styles.u_nav}>
      <li className={styles.li_nav}><Link className={styles.li_nav_link} to="/">Home</Link></li>
      <li className={styles.li_nav}><Link className={styles.li_nav_link} to="/article/new">+ Article</Link></li>
      <li className={styles.li_nav}><Link className={styles.li_nav_link} to="/article/all">Articles</Link></li>
    </ul>
  );
}

const Home = () => {
  return (
    <div>
      <div>
        <em>Made by Quentin Piotrowski and PO Velly</em>
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

  return (
    <div className={styles.articleList}>
      {articles.map((article, id) => {
        return (<div className={styles.articleWrapper} key={id}> Article #{id} : <Link to={"/article/edit/" + id}>Edit</Link>
            <div className={styles.articleContent} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(article)}} />
        </div>)}
      )}
    </div>);
}

const NewArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const [editor, setEditor] = useState(null);

  const handleSubmit = () => {
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
  const [status, setStatus] = useState("EXISTING");

  if (contract) {

    contract.methods.getAllIds().call().then((ids) => {

      if (ids.includes(id)) {
        contract.methods.articleContent(id).call().then((res) => {
            setContent(res);
        });
      } else {
        setStatus("DOESNT_EXIST");
      }

    });

  }

  if (status === "DOESNT_EXIST")
    return (<div><em>404 - Article #{id} does not exist</em></div>);

  return (
    <div id="article" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize("<h5>Article #" + id + "</h5>" + content )}} />
  );
}

const EditArticle = () => {
  const contract = useSelector(({ contract }) => contract);
  const [editor, setEditor] = useState(null);
  const { id } = useParams();
  const [status, setStatus] = useState("EXISTING");

  const handleSubmit = e => {
    e.preventDefault();
    if (contract) {
      contract.methods.editArticle(id, editor.getContent()).send();
    }
  };
  useEffect(() => {
    if (contract) {

      contract.methods.getAllIds().call().then((ids) => {

        if (ids.includes(id)) {

          contract.methods.articleContent(id).call().then((res) => {

            const editor = new MediumEditor(`.${styles.editable}`);
            editor.setContent(res);
            setEditor(editor);
          });

        } else {
          setStatus("DOESNT_EXIST");
        }
      });

    }

  }, [setEditor, contract, id]);

  if (status === "DOESNT_EXIST")
    return (<div><em>404 - Article #{id} does not exist</em></div>);

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
