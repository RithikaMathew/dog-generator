import { useState, useEffect } from 'react'
import './App.css'
import loadingGIF from "./assets/loading.gif"
const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;
const DOG_API_URL = `https://api.thedogapi.com/v1/images/search?api_key=${ACCESS_KEY}`;


function App() {
  const [dogObject, setDogObject] = useState(null)
  const [knownDogs, setKnownDogs] = useState([])
  const [banList, setBanList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isButtonClicked, setIsButtonClicked] = useState(false)


  const callAPI = async () => {
    let response;
    let bool = true;
    console.clear()
    setIsLoading(true)
    setIsButtonClicked(true)
    do {
      response = await fetch(DOG_API_URL + "&has_breeds=1") //Only return images which have breed data attached. Integer - 0 or 1. Default is 0
      response = await response.json();
      bool = ('temperament' in response[0].breeds[0] && 'breed_group' in response[0].breeds[0]) ? isInBanList(response[0].breeds[0].life_span, response[0].breeds[0].breed_group, response[0].breeds[0].weight.imperial, response[0].breeds[0].temperament.substring(0, response[0].breeds[0].temperament.indexOf(","))) //for temperment, only the first index is taken
        :
        false;
      console.log(bool + " " + !('temperament' in response[0].breeds[0]))
    } while (!('temperament' in response[0].breeds[0] && 'breed_group' in response[0].breeds[0]) || bool) //while the dog doesn't have a temperament or the dog's attributes are in the ban list ex: false && false = exit
    setDogObject(response[0])
    setKnownDogs([...knownDogs, { name: `${response[0].breeds[0].name}`, url: `${response[0].url}` }])// url takes you to the image
    setIsLoading(false)
    
  }

  const isInBanList = (a1, a2, a3, a4) => {
    if (banList.length === 0) {
      return false
    }

    for (const atr of banList) {
      if ((atr === a1 || atr === a2) || atr === a3 || atr === a4) {
        return true
      }
    }
    return false
  }

  const addToBanList = (e) => {
    console.log([...banList, e.target.textContent]) //e.target refers to the element that was clicked, and textContent gets the text inside that element
    setBanList([...banList, e.target.textContent])
  }

  const removeFromBanList = (e) => {
    const attribute = e.target.textContent
    const i = banList.indexOf(attribute)

    setBanList(banList.slice(0, i).concat(banList.slice(i + 1))) //This concatenates the two arrays created by the slice methods, effectively creating a new array that includes all items in banList except the one at index i.

  }

  return (
    <div className="app">
      <div className='known-dogs'>
        <h2>Who have we seen so far?</h2>
        {isButtonClicked && knownDogs.map((dog, index) => {
          return (
            <>
              <img src={dog.url} key={`knownDog-${index}`} />
              <p>{dog.name}</p>
            </>)
        })}
      </div>
      <div className='current-dog-container'>
        <div className='current-dog'>
          <h1>🐶Veni Vici🐶</h1>
          <h3>Discover dogs by clicking the 'Discover' button!</h3>
          {isButtonClicked && (
            <>
              {dogObject && <h2>{dogObject.breeds[0].name}</h2>}
              {dogObject &&
                <div className='dog-attributes'>
                  <button onClick={addToBanList}>{dogObject.breeds[0].breed_group}</button>
                  <button onClick={addToBanList}>{dogObject.breeds[0].life_span}</button>
                  <button onClick={addToBanList}>{dogObject.breeds[0].weight.imperial + ' lbs'}</button>
                  <button onClick={addToBanList}>{dogObject.breeds[0].temperament.substring(0, dogObject.breeds[0].temperament.indexOf(","))}</button>     
                </div>}
              <img src={(isLoading ? `${loadingGIF}` : dogObject.url)} />
            </>
          )}

        </div>
        <button className='discover' onClick={callAPI}>Discover!</button>
      </div>
      <div className='banlist'>
        <h2>Ban List</h2>
        <h3>Select an attribute in the displayed list to ban it</h3>
        {isButtonClicked && banList.length > 0 && banList.map((attribute, index) => {
          return <button onClick={removeFromBanList} key={`banList-${index}`}>{attribute}</button>
        })}
      </div>
    </div>
  )
}

export default App