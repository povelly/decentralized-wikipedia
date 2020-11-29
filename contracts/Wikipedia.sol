pragma solidity ^0.5.0;

contract Wikipedia {
  struct Article {
    string content;
  }

  uint[] public ids;
  mapping (uint => Article) public articlesById;

  constructor() public {
    uint index = 0;
    ids.push(index);
    Article memory newArticle = Article("This is your first article in your contract");
    articlesById[index] = newArticle;
  }

  function articleContent(uint index) public view returns (string memory) {
    return articlesById[index].content;
  }

  function getAllIds() public view returns (uint[] memory) {
    return ids;
  }

  // Write your code here.

  function addArticle(string memory content) public {
    uint index = ids.length;
    Article memory newArticle = Article(content);
    articlesById[index] = newArticle;
  }

  function editArticle(uint index, string memory content) public {
    Article memory updatedArticle = Article(content);
    articlesById[index] = updatedArticle;
  }

}
