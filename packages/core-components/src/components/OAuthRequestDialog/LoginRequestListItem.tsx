/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useState } from 'react';
import { isError } from '@backstage/errors';
import {
  configApiRef,
  PendingOAuthRequest,
  useApi,
} from '@backstage/core-plugin-api';
import { coreComponentsTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@material-ui/core/Box';

export type LoginRequestListItemClassKey = 'root';

const useItemStyles = makeStyles(
  theme => ({
    root: {
      paddingLeft: theme.spacing(2),
    },
    button: {
      marginLeft: theme.spacing(2),
    },
  }),
  { name: 'BackstageLoginRequestListItem' },
);

type RowProps = {
  request: PendingOAuthRequest;
  busy: boolean;
  setBusy: (busy: boolean) => void;
};

const LoginRequestListItem = ({ request, busy, setBusy }: RowProps) => {
  const classes = useItemStyles();
  const [error, setError] = useState<string>();
  const { t } = useTranslationRef(coreComponentsTranslationRef);
  const configApi = useApi(configApiRef);

  const handleContinue = async () => {
    setBusy(true);
    try {
      await request.trigger();
    } catch (e) {
      setError(isError(e) ? e.message : 'An unspecified error occurred');
    } finally {
      setBusy(false);
    }
  };

  const IconComponent = request.provider.icon;
  const message =
    request.provider.message ??
    t('oauthRequestDialog.message', {
      appTitle: configApi.getString('app.title'),
      provider: request.provider.title,
    });

  return (
    <ListItem disabled={busy} classes={{ root: classes.root }}>
      <ListItemAvatar>
        <IconComponent fontSize="large" />
      </ListItemAvatar>
      <Box display="flex" alignItems="center" flex={1}>
        <Box flex={1}>
          <ListItemText
            primary={request.provider.title}
            secondary={
              <>
                {message && (
                  <Typography variant="subtitle2" color="textSecondary">
                    {message}
                  </Typography>
                )}
                {error && <Typography color="error">{error}</Typography>}
              </>
            }
          />
        </Box>
        <Button
          color="primary"
          variant="contained"
          onClick={handleContinue}
          className={classes.button}
        >
          {t('oauthRequestDialog.login')}
        </Button>
      </Box>
    </ListItem>
  );
};

export default LoginRequestListItem;
