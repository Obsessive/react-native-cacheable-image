import React from 'react';
import { Image, ActivityIndicator } from 'react-native';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import ResponsiveImage from 'react-native-responsive-image';
const debug = 1
const SHA1 = require("crypto-js/sha1");
const URL = require('url-parse');

export default
    class CacheableImage extends React.Component {

    constructor(props) {
        super(props)
        this.imageDownloadBegin = this.imageDownloadBegin.bind(this);
        this.imageDownloadProgress = this.imageDownloadProgress.bind(this);

        this.state = {
            isRemote: false,
            cachedImagePath: null,
            downloading: false,
            cacheable: true,
            jobId: null
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.source != this.props.source) {
            this._processSource(nextProps.source);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    async imageDownloadBegin(info) {
        if (debug) {
            console.tron.log("Download begun with jobId: " + info.jobId)
        }
        this.setState({ downloading: true, jobId: info.jobId });
    }

    async imageDownloadProgress(info) {
        if ((info.contentLength / info.bytesWritten) == 1) {
            this.setState({ downloading: false, jobId: null });
        }
    }

    async checkImageCache(imageUri, cachePath, cacheKey) {

        const dirPath = DocumentDirectoryPath + '/' + cachePath;
        const filePath = dirPath + '/' + cacheKey;
        if (debug) {
            console.tron.log("Checking image cache in path " + dirPath)
            console.tron.log("File path is : " + filePath)
        }
        RNFS
            .stat(filePath)
            .then((res) => {
                if (res.isFile()) {
                    if (debug) {
                        console.tron.log("Cache HIT")
                    }

                    // means file exists, ie, cache-hit
                    // if download went bad and we have an empty file.
                    if (res.size < 100) {
                        if (debug) {
                            console.tron.log("Cache HIT, but image is empty")
                        }
                        this._handleCacheMiss(imageUri, cachePath, cacheKey, dirPath, filePath)

                    } else {
                        this.setState({ cacheable: true, cachedImagePath: filePath });
                    }
                }
            })
            .catch((err) => {
                this._handleCacheMiss(imageUri, cachePath, cacheKey, dirPath, filePath)
            });
    }
    _handleCacheMiss(imageUri, cachePath, cacheKey, dirPath, filePath) {
        if (debug) {
            console.tron.log("Cache MISS")
        }

        let downloadOptions = {
            fromUrl: imageUri,
            toFile: filePath,
            background: true,
            begin: this.imageDownloadBegin,
            progress: this.imageDownloadProgress
        };
        if (debug) {
            console.tron.log("Download options:");
            console.tron.log(downloadOptions);
        }
        // directory exists.. begin download
        return RNFS
            .downloadFile(downloadOptions).promise.then((res) => {
                if (debug) {
                    console.tron.log("Downloaded Complete")
                }
                this.setState({ cacheable: true, cachedImagePath: filePath });
            })
            .catch((err) => {
                if (debug) {
                    console.tron.log(err)
                    console.tron.log("Download failed")
                }
                this.setState({ cacheable: false, cachedImagePath: null });
            });

    }

    _processSource(source) {
        console.tron.log('processing source')
        if (source !== null
            && typeof source === "object"
            && source.hasOwnProperty('uri')) { // remote
            if (debug) {
                console.tron.log('remote img detected')
            }
            const url = new URL(source.uri);

            const type = url.pathname.replace(/.*\.(.*)/, '$1');
            const cacheKey = SHA1(url.pathname) + '.' + type;
            if (debug) {
                console.tron.log('Url provided is:')
                console.tron.log(url)
                console.tron.log('Type:' + type)
                console.tron.log('Cache key generated:' + cacheKey)
            }
            this.checkImageCache(source.uri, url.host, cacheKey);

            this.state.isRemote = true;

        }
        else {
            if (debug) {
                console.tron.log('Local img source detected')
            }
            this.state.isRemote = false;
        }
    }

    componentWillMount() {
        this._processSource(this.props.source);
    }

    componentWillUnmount() {
        if (this.state.downloading && this.state.jobId) {
            RNFS.stopDownload(this.state.jobId);
        }
    }


    render() {
        if (!this.state.isRemote && !this.state.cacheable) {
            if (debug) {
                console.tron.log('Rendering from local disk')
            }
            return this.renderLocal();
        }

        if (this.state.cacheable && this.state.cachedImagePath) {
            if (debug) {
                console.tron.log('Rendering from cache')
            }
            return this.renderCache();
        }

        if (this.props.defaultSource) {
            if (debug) {
                console.tron.log('Rendering from default source')
            }
            return this.renderDefaultSource();
        }

        return (
            <ActivityIndicator {...this.props.activityIndicatorProps} />
        );
    }

    renderCache() {
        return (
            <ResponsiveImage {...this.props} source={{ uri: 'file://' + this.state.cachedImagePath }}>
                {this.props.children}
            </ResponsiveImage>
        );
    }

    renderLocal() {
        return (
            <ResponsiveImage {...this.props} >
                {this.props.children}
            </ResponsiveImage>
        );
    }

    renderDefaultSource() {
        const { defaultSource, ...props } = this.props;
        return (
            <CacheableImage {...props} source={defaultSource}>
                {this.props.children}
            </CacheableImage>
        );
    }
}

CacheableImage.propTypes = {
    activityIndicatorProps: React.PropTypes.object
};