'use strict';

import isEmpty from 'lodash.isempty';
import isUndefined from 'lodash.isundefined';
import React from 'react';
import Loader from 'react-loader';
import { Choose, When, Otherwise } from 'react-conditioner'
import Box from '../components/box';
import Apply from '../components/results/apply';
import Application from '../components/application';
import MoreInfo from '../components/results/info';
import StudentInfo from '../components/results/student';
import Empty from './404';
import Conditional from '../components/results/conditional';
import { connect } from 'react-redux';

import { fetchJurisdiction } from '../actions';

class Jurisdiction extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      applicationIsShown: false,
      applicaitonIsSubmitted: false
    };
  }

  getJurisdictionId () {
    return this.props.match.params.jurisdictionId;
  }
  showApplication (event) {
    event.preventDefault();
    this.setState({applicationIsShown: true});
  }

  onSubmit () {
    this.setState({
      applicationIsSubmitted: true,
      applicationIsShown: false
    });
  }

  componentDidMount () {
    this.props.fetchJurisdiction(this.getJurisdictionId());
  }

  componentDidUpdate (prevProps) {
    const oldId = prevProps.match.params.jurisdictionId;
    const newId = this.getJurisdictionId()
    if (oldId !== newId) {
      this.props.fetchJurisdiction(newId);
    }
  }

  render () {
    const { jurisdiction, notFound } = this.props;
    let loaded = false;
    let image = null;
    let secondColumn;
  
    if (!isEmpty(jurisdiction)) {
      loaded = true;
    }

    if (!isUndefined(jurisdiction.id)) {
      image = 'https://s3.amazonaws.com/voteworker/jurisdictions/' + jurisdiction.id + '.png';
    }

    if (notFound) {
      return (
        <Empty />
      );
    }

    if (this.state.applicationIsShown) {
      secondColumn = (
        <Application jurisdiction_id={jurisdiction.id} onSubmit={this.onSubmit} />
      );
    } else {
      let message;
      if (this.state.applicaitonIsSubmitted) {
        message = (
          <div className='callout success' >
            <p>Your application was submitted. Thank you!</p>
          </div>
        );
      }
      if (jurisdiction.display === 'Y') {
        secondColumn = (
          <div>
            {message}
            <div className='text-header'>Registration Requirements</div>
            <ul>
              <Choose>
                <When condition={ jurisdiction.registration_status === 'S' }>
                  <li><p>You can be registered anywhere in the state to work on Election Day in {jurisdiction.name}.</p></li>
                </When>
                <When condition={ jurisdiction.registration_status === 'J' }>
                  <li><p>You must be registered in {jurisdiction.name} to work on Election Day</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>
              
              <Choose>
                <When condition={ jurisdiction.pre_registration === 'Y' }>
                  <li><p>You must be pre-registered to vote.</p></li>
                </When>
                <When condition={ jurisdiction.pre_registration === 'N' }>
                  <li><p>You do not need to be pre-registered to vote.</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>
            </ul>

            <div className='text-header'>Hours and Compensation</div>
            <ul>
              <li>
                <Conditional title='Start Time' value={jurisdiction.hours_start} else='N/A' />
              </li>
              <li>
                <Conditional title='End Time' value={jurisdiction.hours_end} else='N/A' />
              </li>
              <li>
                <Conditional title='Compensation Range' value={jurisdiction.compensation} else='N/A' />
              </li>

              <Choose>
                <When condition={ jurisdiction.full_day_req === 'Y' }>
                  <li><p>You must work the full day.</p></li>
                </When>
                <When condition={ jurisdiction.full_day_req === 'N' }>
                  <li><p>You can split the day with another election worker</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>
            </ul>

            <div className='text-header'>Work Requirements</div>
            <ul>
              <li>
                <Conditional title='Minimum Age' value={jurisdiction.minimum_age} else='N/A' />
              </li>

              <Choose>
                <When condition={ jurisdiction.interview === 'Y' }>
                  <li><p>People who sign up to work on Election Day are interviewed.</p></li>
                </When>
                <When condition={ jurisdiction.pre_registration === 'N' }>
                  <li><p>There is no interview.</p></li>
                </When>
                <Otherwise>
                  <Conditional title='Interview:' value={jurisdiction.interview} />
                </Otherwise>
              </Choose>

              <Choose>
                <When condition={ jurisdiction.training === 'Y' }>
                  <li><p>You must attend a training session.</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>

              <Choose>
                <When condition={ jurisdiction.complete_training === 'Y' }>
                  <li><p>You must complete training for each election.</p></li>
                </When>
                <When condition={ jurisdiction.complete_training === 'N' }>
                  <li><p>Once you are trained, you do not need to attend training for each election. The local election official will let you know when new training is required.</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>

              <Choose>
                <When condition={ jurisdiction.must_have_email === 'Y' }>
                  <li><p>You are required to have an email address and access to a computer and the Internet.</p></li>
                </When>
                <Otherwise>
                  <span></span>
                </Otherwise>
              </Choose>
            </ul>

            <div className='text-header'>Further Notes</div>
            <p>{jurisdiction.further_notes}</p>
            <Conditional title='Last Updated' value={jurisdiction.obtained_at}/>
          </div>
        );
      }
      else {
        secondColumn = (
          <div>
            {message}
            <p>Workelections.com does not yet have information for this jurisdiction.</p>
          </div>
        );
      }
    }

    // Results HTML
    return (
      <Box>
        <Loader loaded={loaded}>
          <div className='results-split-container medium-5 columns'>
            <div className='juris-header'>{jurisdiction.name}, {jurisdiction.state.alpha}</div>
            <div className='county-image'>
              <img src={image}></img>
            </div>
            <MoreInfo url={jurisdiction.website} /> &nbsp;
            <StudentInfo url={jurisdiction.student_website} />
            <br />
            <Apply url={jurisdiction.application} email={jurisdiction.email} click={this.showApplication} />
            <br/>
            <div className='text-header'>Contact Information</div>
            <Conditional title='Phone' value={jurisdiction.telephone} />
            <Conditional title='Email' value={jurisdiction.email} />
            <Conditional title='Office Address' value={jurisdiction.office_address} else='N/A' />
            <Conditional title='Mailing Address' value={jurisdiction.mailing_address} />
          </div>
          <div className='results-split-container medium-6 columns'>
            {secondColumn}
          </div>
        </Loader>
      </Box>
    );
  }
}

function mapStateToProps (state) {
  return {
    jurisdiction: state.jurisdiction.data,
    notFound: state.jurisdiction.notFound
  };
}

export default connect(
  mapStateToProps,
  { fetchJurisdiction }
)(Jurisdiction);