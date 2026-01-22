import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import Plyr from 'plyr/dist/plyr';
import 'plyr/dist/plyr.css';

class FalconPlyr extends React.Component {
  plyrRef = createRef();
  player = null;
  componentDidMount() {
    this.player = new Plyr(this.plyrRef);
  }

  render() {
    const { videoId } = this.props;

    return (
      <div className="position-relative">
        <div
          className="plyr__video-embed"
          ref={e => {
            this.plyrRef = e;
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`}
            allowFullScreen
            allow="autoplay"
            title={videoId}
          />
        </div>
      </div>
    );
  }
}

Plyr.propTypes = { value: PropTypes.any };

Plyr.defaultProps = { value: `Plyr` };

FalconPlyr.propTypes = {
  videoId: PropTypes.string.isRequired
};

FalconPlyr.defaultProps = {
  videoId: ''
};

export default FalconPlyr;
