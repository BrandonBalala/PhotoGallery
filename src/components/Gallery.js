import React, {
    Component
} from 'react';

import loadingIcon from '../assets/img/loading-icon.png';
import '../assets/css/Gallery.css';

class Gallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchCriteria: '',
            noResultsFound: false,
            images: [],
            isLoading: true,
            isTyping: false,
            typingTimeout: 0,
            showModal: false,
            selectedImgIndex: -1
        }
        
        // Binding this to event handlers
        this.onScroll = this.onScroll.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
        this.onModalPreviousImage = this.onModalPreviousImage.bind(this);
        this.onModalNextImage = this.onModalNextImage.bind(this);
        this.onModalKeyPress = this.onModalKeyPress.bind(this);
    }

    // Lifecycle Methods
    componentDidMount() {
        this.fetchPictures("", 15);
        window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, false);
    }


    // Event Handlers
    onScroll(event) {
        let searchCriteria = this.state.searchCriteria;
        let numberOfResults = 5;

        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) && !this.state.isLoading) {
            this.fetchPictures(searchCriteria, numberOfResults);
        }      
    }

    onSearchChange(event) {
        const self = this;
        const searchCriteria = event.target.value;

        if (this.state.typingTimeout) {
            clearTimeout(this.state.typingTimeout);
        }

        this.setState({
            searchCriteria: searchCriteria,
            noResultsFound: false,
            typing: false,
            typingTimeout: setTimeout(function () {
                self.setState({
                    images: []
                });
                self.fetchPictures(searchCriteria, 15);
            }, 1000)
        });
    }

    onModalOpen(event) {
        window.addEventListener("keypress", this.onModalKeyPress);
        this.setState({
            selectedImgIndex: this.state.images.indexOf(event.target.src),
            showModal: true
        });
    }

    onModalClose() {
        window.removeEventListener("keypress", this.onModalKeyPress);
        this.setState({
            selectedImgIndex: -1,
            showModal: false
        });
    }

    onModalPreviousImage(event) {
        event.stopPropagation();
        let previousImageIndex = this.state.images.indexOf(event.target.src) + -1;
        this.updateModalState((previousImageIndex > -1) ? previousImageIndex : -1);
    }

    onModalNextImage(event) {
        event.stopPropagation();
        let nextImageIndex = this.state.images.indexOf(event.target.src) + 1;
        this.updateModalState((nextImageIndex < this.state.images.length) ? nextImageIndex : -1)
    }

    onModalKeyPress(event) {
        if(event.code === "ArrowLeft") {
            let previousImageIndex = this.state.selectedImgIndex -1;
            this.updateModalState((previousImageIndex > -1) ? previousImageIndex : -1);
        } else if(event.code === "ArrowRight") {
            let nextImageIndex = this.state.selectedImgIndex + 1;
            this.updateModalState((nextImageIndex < this.state.images.length) ? nextImageIndex : -1)
        } else if(event.code === "Escape") {
            this.onModalClose();
        }
    }

    updateModalState(index) {
        if (index === -1){
            this.onModalClose();
        } else {
            this.setState({
                selectedImgIndex: index,
                showModal: true
            });
        }
    }

    getRandomDimension(min, max) {
        return Math.floor(Math.random() * max) + min; 
    }


    // Fetching Pictures from Unsplash
    fetchPictures(searchCriteria, numberOfResults) {
        const errorPage = "https://images.unsplash.com/source-404?";
        const notFoundSearchCriteria = "cat";
        const minDimension = 250;
        const maxDimension = 750;

        this.setState({
            isLoading: true
        });

        let promises = [];
        for (let i = 0; i < numberOfResults; i++) {
            let width = this.getRandomDimension(minDimension, maxDimension);
            let height = this.getRandomDimension(minDimension, maxDimension);
            let imageURL = `https://source.unsplash.com/${width}x${height}/?${searchCriteria}`;
            promises.push(fetch(imageURL));
        }

        Promise.all(promises)
            .then(res => {
                let imagesURL = [];
                for (let i = 0; i < res.length; i++) {
                    imagesURL.push(res[i].url);
                }

                return imagesURL;
            })
            .then(data => {
                if (data[0].startsWith(errorPage)) {
                    this.setState({noResultsFound: true});
                    this.fetchPictures(notFoundSearchCriteria, 8);
                } else {
                    this.setState({
                        images: this.state.images.concat(data),
                        isLoading: false
                    });
                }
            })
    }

    // Rendering Components of Gallery
    renderNoResultsFoundLabel() {
        return (
            <p className="noResultsFound">No results found, here are pictures of cats instead!</p>
        );
    };

    renderLoadingSpinner () {
        return (
            <img src={loadingIcon} className="loadingIcon" alt="loading..." />
        );
    };

    renderImgModal() {
        const selectedImg = this.state.images[this.state.selectedImgIndex];

        return (
            <div className="modalContainer" onClick={this.onModalClose}>
                <button type="button" className="modalCloseBtn" onClick={this.onModalClose}>X</button>
                <img src={selectedImg} className="modalImg" alt="Large Img" onClick={this.onModalNextImage}/>
            </div>
        );
    }

    render() {
        const galleryItems = this.state.images.map((image, index) => (
            <div className="galleryItem" key={index}>
                <img className="galleryImg" src={image} alt="" onClick={this.onModalOpen}></img>
            </div>
        ));
        
        const resultsFound = (this.state.noResultsFound) ? this.renderNoResultsFoundLabel() : null;

        const loadingSpinner = (this.state.isLoading) ? this.renderLoadingSpinner() : null;

        const modal = (this.state.showModal) ? this.renderImgModal() : null;

        return ( 
            <div>
                {modal}

                <h1 className="galleryTitle">Gallery</h1>
                <input type="text" className="searchBar" 
                    placeholder="what are you looking for?"
                    onChange={this.onSearchChange}></input>
                {resultsFound}

                <div className="gallery">
                    {galleryItems}
                </div>

                {loadingSpinner}
            </div>
        );
    }
}

export default Gallery;