import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Link, Route } from 'react-router-dom'
import * as Ethereum from './services/Ethereum'
import styles from './App.module.css'
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import Web3 from 'web3';
import Wikipedia from './contracts/Wikipedia.sol';

const HandleSubmit = (e, content) => {
  e.preventDefault();
  alert(content.content);

  const [articles, setArticles] = useState([]);
  const contract = useSelector(({ contract }) => contract);
  useEffect(() => {
    if (contract) {
      contract.methods.newArticle(content).call()
    }
  }, [contract, setArticles]);
}

const NewArticle = () => {
  const [content, setContent] = useState(0);

  const [editor, setEditor] = useState(null)
  useEffect(() => {
    setEditor(new MediumEditor(`.${styles.editable}`))
  }, [setEditor])
  return (
    <form onSubmit={(e) => HandleSubmit(e, {content})}>
      <div className={styles.subTitle}>New article</div>
      <div className={styles.mediumWrapper}>
        <input type="text" className={styles.editable} placeholder="Type your text here" onChange={(e)=>setContent(e.target.value)} />
        {/*
        <textarea className={styles.editable} onChange={(e)=>alert("update")} />
        */}
      </div>
      <input type="submit" value="Submit" />
    </form>
  )
}

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
  const [articles, setArticles] = useState([])
  const contract = useSelector(({ contract }) => contract)
  useEffect(() => {
    if (contract) {
      contract.methods.articleContent(0).call().then(console.log)
      contract.methods.getAllIds().call().then(console.log)
    }
  }, [contract, setArticles])
  return <div>{articles.map(article => article)}</div>
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
