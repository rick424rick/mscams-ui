import React, { Suspense, useState } from 'react'
import { Grid, Paper, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Vote from './Vote'
import { useSelector, useDispatch } from 'react-redux'
import { vote, changeVote } from '../actions/actionCreator'
import ApplicationForm from './ApplicationForm'
import { useTranslation } from 'react-i18next'


const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '50vh',
        margin: '5vh 10vh',
        padding: '5vh 10vh',
        textAlign: 'left'
    },
    details: {
        height: '90%',
        '& > *': {
            margin: theme.spacing(1),
        }
    },
    title: {
        fontSize: 'large',
        fontWeight: 'bold',
        textAlign: 'left'
    },
    textField: {
        minHeight: '5em',
        padding: '8px',
        paddingBottom: '1em'
    },
    button: {
        margin: '0 10px'
    }
}))

function ApplicationDetailsComponent({ application }) {
    const { id, amount,
        event, event_date, description, budget, first_name, last_name } = application
    const votes = useSelector(state => state.fullApplications[id].votes)
    const token = useSelector(state => state._token)
    const user = useSelector(state => state.user)
    const classes = useStyles()
    const { t } = useTranslation()
    const votesDisplay = votes && votes.length ? votes.map(vote => <Vote key={vote.voter + vote.application_id} vote={vote} />) : t('No votes have come in yet')


    // determine if the user has voted
    let notVoted = user && votes && votes.every(vote => vote.voter !== user.username)

    const dispatch = useDispatch()
    const approve = () => {
        notVoted ? dispatch(vote(token, id, true)) : dispatch(changeVote(token, id, true))
        setVoteView('change')
    }
    const deny = () => {
        notVoted ? dispatch(vote(token, id, false)) : dispatch(changeVote(token, id, false))
        setVoteView('change')
    }
    const toEdit = () => {
        setEdit(true)
    }

    // Determine the correct view to show user
    const [voteView, setVoteView] = useState(notVoted ? 'toVote' : 'change')
    const [edit, setEdit] = useState(false)

    if (edit) return <ApplicationForm application={application} />

    let voteButtons
    if (voteView === 'toVote') {
        voteButtons = (<Grid item xs={5}>
            <Button onClick={approve} className={classes.button} variant='contained' color='primary'>{t('Approve')}</Button>
            <Button onClick={deny} className={classes.button} variant='contained' color='secondary'>{t('Deny')}</Button>
        </Grid>)
    } else {
        voteButtons = <Button onClick={() => setVoteView('toVote')} color='primary'>{t('Change Vote')}</Button>
    }

    // admin portion
    const adminOnly = (<>
        <Grid item xs={12}><b>{t('Votes')}:</b></Grid>
        <Grid item style={{ display: 'flex' }} xs={6}>
            {votesDisplay}
        </Grid>
        {
            voteButtons
        } </>)

    // non-admin    
    const nonAdmin = (
        <>
            <Grid item xs={12} style={{ textAlign: 'right' }}>
                <Button onClick={toEdit} className={classes.button} variant='contained' color='primary'>{t('Edit')}</Button>
            </Grid>
        </>
    )

    return (
        <Paper elevation={2} className={classes.root}>
            <Grid className={classes.details} container>
                <Grid className={classes.title} item xs={12}>{t('Application Details')}</Grid>
                <Grid item xs={5}><b>{t('Amount')}:</b> {amount}</Grid>
                <Grid item xs={5}><b>{t('Applicant')}:</b> {first_name + ' ' + last_name}</Grid>
                <Grid item xs={5}><b>{t('Event')}:</b> {event}</Grid>
                <Grid item xs={5}><b>{t('Event Date')}:</b> {event_date}</Grid>
                <Grid item xs={12}><b>{t('Description')}:</b></Grid>
                <Grid item xs={12}>
                    <Paper className={classes.textField} elevation={3}>
                        {description}
                    </Paper>
                </Grid>
                <Grid item xs={12}><b>{t('Budget')}:</b></Grid>
                <Grid item xs={12}>
                    <Paper className={classes.textField} elevation={3}>
                        {budget}
                    </Paper>
                </Grid>
                {user && user.category === 'admin' ? adminOnly : nonAdmin}
            </Grid>
        </Paper>
    )
}

export default function ApplicationDetails({ application }) {
    return (
        <Suspense fallback='en'>
            <ApplicationDetailsComponent application={application} />
        </Suspense>
    )
}
