# react-native-cacheable-image-2
An Image component for React Native that will cache itself to disk.
for of react-native-cacheable-image

## Notes 2
We got obsessed with this component and decided to refactor a bit to achieve the stability we needed.
few things different from the original
- Checks for corrupted downloads (on bad connections this is common, leading to caching and displaying the corrupted blank image file)
- Logging. Lots of logging. Set debug to 1 and see whats going on inside the component in real time using reactotron.

### I recommend you try both the variants (this and the original) and leave a feedback so we can improve this component

## Notes 1
CacheableImage understands its state. Once you define a source the first time it's state has been set. You can create another component with the same source and it will load the same cached file without having to fetch from a remote URI.

However, if you happen to change the source, the original cached file will be removed and a new cached image will be created. Basically, don't change the source once you've set it unless you need to. Create a new CacheableImage component and swap if you don't want the current image to be wiped from the cache.

This is beneficial in say you have a User Profile Image.  If the user changes their image, the current profile image will be removed from the cache and the new image will be saved to the cache.

Local assets are not cached and are passed through. (ie, Default/Placeholder Images)

This component has been tested with AWS CloudFront and as such only uses the path to the image to generate its hash. Any URL query params are ignored.

Pull Requests for enhancing this component are welcome.



## Installation
npm i react-native-cacheable-image --save

then replace the image.js file in your node_module folders.

## Dependencies
- [react-native-responsive-image](https://github.com/Dharmoslap/react-native-responsive-image) to provide responsive image handling.
- [url-parse](https://github.com/unshiftio/url-parse) for url handling
- [crypto-js](https://github.com/brix/crypto-js) for hashing
- [react-native-fs](https://github.com/johanneslumpe/react-native-fs) for file system access

### Dependency Installation
- For `react-native-fs`. You need to link the module. Either try `rnpm link react-native-fs` or `react-native link react-native-fs`. See react-native-fs for more information.

## Usage
import CacheableImage from 'react-native-cacheable-image'

### Props

* `activityIndicatorProps` - pass this property to alter the ActivityIndicator
* `defaultSource`           - pass this property to provide a default source to fallback on (the defaultSource is attached to another CacheableImage component)


## Example

    <CacheableImage
        resizeMode="cover"
        style={{flex: 1}}
        source={{uri: 'http://www.foobar.com/image.jpeg'}}
    >
	    <CacheableImage
            style={styles.nestedImage}
            source={require(./someImage.jpeg)}
            defaultSource={{uri: 'http://www.foobar.com/defaultImage.jpeg'}}
        />
    </CacheableImage>


LEGAL DISCLAIMER
----------------

This software is published under the MIT License, which states that:

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

