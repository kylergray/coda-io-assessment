import React, {Component} from 'react';
import { InputGroup, FormControl, Button, Form, Card, Placeholder, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { API_KEY } from './Api';

class App extends Component {

  API_HEADERS = {
    "x-rapidapi-host": "tasty.p.rapidapi.com",
    "x-rapidapi-key": API_KEY
  };

  constructor (props){
    super(props);
    this.state = {
      recipes: [],
      tags: [],
      selectedTag: "",
      currentSearch: "",
      tagsLoading: false,
      searchLoading: false,
      resultCount: 0,
      searchFail: false
    };
  }

  async componentDidMount() {
    await this.fetchTags();
  }

  async fetchTags() {
    const endpoint = "https://tasty.p.rapidapi.com/tags/list";
    try {
      this.setState({
        tagsLoading: true
      });
      let tags = await fetch(endpoint, {"method": "GET", "headers": this.API_HEADERS});
      let resolved = await tags.json();
      let elements = []
      resolved.results.forEach(element => {
        elements.push(<option value={element.name}>{element.display_name}</option>)
      });
      this.setState({
        tags: elements,
        tagsLoading: false
      })
    } catch (err) {
      this.setState({
        searchFail: true
      })
    }
  }

  async searchRecipes() {
    const endpoint = "https://tasty.p.rapidapi.com/recipes/list?from=0&size=40&tags=" +
        this.state.selectedTag + "&q=" + this.state.currentSearch;
    try {
      this.setState({
        searchLoading: true,
        recipes: []
      });
      let tags = await fetch(endpoint, {"method": "GET", "headers": this.API_HEADERS});
      let resolved = await tags.json();
      let elements = [];
      resolved.results.forEach(element => {
        elements.push(
          <Col>
            <Card>
              {element.is_shoppable ? <Card.Header className="text-muted">Easy to shop</Card.Header> : ''}
              <Card.Img variant="top" src={element.thumbnail_url} />
              <Card.Body>
                <Card.Title>{element.name}</Card.Title>
                <Card.Text>Creator: {element.credits[0].name}</Card.Text>
                <Card.Text>{element.yields}</Card.Text>
                <a href={"https://tasty.co/recipe/" + element.slug}><Button variant="primary">Recipe</Button></a>
              </Card.Body>
            </Card>
          </Col>
        )
      });
      console.log(resolved);
      let resultCount = Math.min(40, resolved.count);
      this.setState({
        recipes: elements,
        searchLoading: false,
        resultCount: resultCount
      })
    } catch (err) {
      this.setState({
        searchFail: true
      })
    }
  }

  render(){
    return (
      <div className="App">
        <h1>RecipeFinder</h1>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Explore Recipes"
            aria-label="recipe-search"
            aria-describedby="recipe search bar"
            onChange={(value) => {this.setState({currentSearch: value.target.value})}}
          />
          <Form.Select aria-label="Default select example" onChange={(value) => {this.setState({selectedTag: value.target.value})}}>
            <option value="">{this.state.tagsLoading ? "Loading Tags" : "Filter by Tag"}</option>
            {this.state.tags}
          </Form.Select>
          <Button variant="outline-secondary" id="search-button" onClick={() => {this.searchRecipes()}}>
            <FontAwesomeIcon icon={faSearch} /> Search
          </Button>
        </InputGroup>
        {this.state.searchFail ? <p>Looks like something went wrong, try again later</p> : ''}
        <p>{this.state.searchLoading ? "Finding your next meal..." : (
        this.state.resultCount === 0 ? "Search for a recipe" : this.state.resultCount + " recipes found")}</p>
        <Row xs={1} md={2} lg={3} xl={4} className="g-8">
          {this.state.searchLoading ?
            Array.from({ length: 20 }).map(() => (
              <Col>
                <Card>
                  <Card.Body>
                    <Placeholder as={Card.Title} animation="glow">
                      <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="glow">
                      <Placeholder xs={7} /> <Placeholder xs={4} />
                      <Placeholder xs={4} />{' '}
                      <Placeholder xs={6} /> <Placeholder xs={8} />
                    </Placeholder>
                    <Placeholder.Button variant="primary" xs={6} />
                  </Card.Body>
                </Card>
              </Col>
            ))
          : this.state.recipes}
        </Row>
      </div>

    );
  }
};



export default App;
